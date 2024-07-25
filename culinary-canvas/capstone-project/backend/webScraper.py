import socket
import ssl
import re
import json
from urllib.parse import urlparse
from html import unescape
import urllib.robotparser
import urllib.parse
import sys
import json


def fetch_html(url):
    parsed_url = urlparse(url)
    host = parsed_url.netloc
    path = parsed_url.path or "/"

    context = ssl.create_default_context()
    with socket.create_connection((host, 443)) as sock:
        with context.wrap_socket(sock, server_hostname=host) as secure_sock:
            secure_sock.send(
                f"GET {path} HTTP/1.1\r\nHost:{host}\r\nConnection: close\r\n\r\n".encode()
            )
            response = b""
            while True:
                chunk = secure_sock.recv(4096)
                if not chunk:
                    break
                response += chunk

    headers, _, body = response.partition(b"\r\n\r\n")
    return body.decode("utf-8", errors="ignore")


def extract_json_ld(html):
    matches = re.findall(
        r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL
    )
    for match in matches:
        try:
            data = json.loads(match)
            if isinstance(data, list):
                data = next(
                    (item for item in data if item.get("@type") == "Recipe"), None
                )
            if data and data.get("@type") == "Recipe":
                return data
        except json.JSONDecodeError:
            pass
    return None


def extract_title(html, json_ld):
    if json_ld and "name" in json_ld:
        return json_ld["name"]
    title_patterns = [
        r"<header><h1>(.*?)</h1></header>" r"<h1[^>]*>(.*?)</h1>",
        r"<title[^>]*>(.*?)</title>",
        r'<meta[^>]*property="og:title"[^>]*content="([^"]*)"',
        r'<header class="entry-header"><h1 class="entry-title">(.*?)</h1></header>',
    ]
    for pattern in title_patterns:
        match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
        if match:
            return unescape(match.group(1).strip())
    return "Unknown Recipe"


def extract_ingredients(html, json_ld):
    if json_ld and "recipeIngredient" in json_ld:
        return json_ld["recipeIngredient"]
    elif json_ld and "Ingredients" in json_ld:
        return json_ld["Ingredients"]
    ingredients = []
    ingredients_patterns = [
        r'<li[^>]*class="[^"]*ingredient[^"]*"[^>]*>(.*?)<li>',
        r'<li[^>]*itemprop="recipeIngredient"[^>]*>(.*?)<li>',
        r'<span[^>]*class="[^"]*ingredient[^"]*"[^>]*>(.*?)</span>',
        r'<ul[^>]*class="[^"]*ingredients[^"]*"[^>]*>(.*?)</ul>',
        r'<li[^>]*class="[^"]*ingredients[^"]*"[^>]*>(.*?)</li>',
        r'<div[^>]*class="[^"]*ingredients[^"]*"[^>]*>(.*?)</div>',
        r"<p>\s*Ingredients\s</p>\s*<p>",
    ]
    for pattern in ingredients_patterns:
        matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)
        if matches:
            ingredients = [re.sub(r"<[^>]+>", "", match).strip() for match in matches]
            break

    if not ingredients:
        ingredients_section = re.search(
            r"ingredients.*?<[ou]>(.*?)</[ou]>", html, re.IGNORECASE | re.DOTALL
        )
        if ingredients_section:
            ingredients = re.findall(
                r"<li>(.*?)</li>", ingredients_section.group(1), re.DOTALL
            )

    cleaned_ingredients = []
    for ingredient in ingredients:
        cleaned = re.sub(r"<[^>]+>", "", ingredient)
        cleaned = unescape(cleaned.strip())
        if cleaned:
            cleaned_ingredients.append(cleaned)
    return cleaned_ingredients


def extract_calories(html, json_ld):
    if json_ld and "nutrition" in json_ld and "calories" in json_ld["nutrition"]:
        return f"{json_ld['nutrition']['calories']} calories"

    specific_case = r'<tbody>.*?<tr>.*?<td[^>]*class="[^"]*nutrition-info\s*__table-cell[^>]*>.*?(\d+)\s*calories.*?</td>.*?</tr>.*?</tbody>'
    match = re.search(specific_case, html, re.IGNORECASE | re.DOTALL)
    if match:
        return f"{match.group(1)} calories"
    calories_patterns = [
        r"(\d+)\s*calories",
        r"calories:?\s*(\d+)",
        r"<[^>]*>(\d+)\s*calories</[^>]*>",
        r'<[^>]*class="[^"]*nutrition[^"]*"[^>]*>.*?(\d+)\s*calories.*?</[^>]*>',
        r"<span[^>]*>(\d+)\s*calories</span>",
        r"<tr[^>]*>.*?calories.*?<td[^>]*>(\d+).*?</td>.*?</tr>",
        r"<td[^>]*>.*?calories.*?</td>*?<td[^>]*>(\d+).*?</td>",
        r"<th[^>]*>.*?calories.*?</th>.*?<td[^>]*>(\d+).*?</td>",
        r"<tr[^>]*>.?<td[^>]*>.*?calories.*?</td>.*?<td[^>]*>\s*(\d+)\s*</td>.*?</tr>",
    ]
    for pattern in calories_patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            return f"{match.group(1)} calories"

    calorie_row = re.search(
        r"<tr[^>]*>(?:(?!<tr).)*?</tr>", html, re.IGNORECASE | re.DOTALL
    )
    if calorie_row:
        numbers = re.findall(r"\d+", calorie_row.group(0))
        if numbers:
            return f"{numbers[0]} calories"

    calorie_proximity = re.search(r"(\d+)\s*(?:calories|kcal)", html, re.IGNORECASE)
    if calorie_proximity:
        return f"{calorie_proximity.group(1)} calories"
    return "Not Available"


def extract_image_url(html, json_ld, base_url):
    if json_ld:
        image = json_ld.get("image")
        if isinstance(image, list) and image:
            image = image[0]
        if isinstance(image, str):
            return image
        elif isinstance(image, dict) and "url" in image:
            return image["url"]
    image_patterns = [
        r'<meta[^>]*property="og:image"[^>]*content="([^"]*)"',
        r'<img[^>]*class="[^"]*recipe-image[^"]*"[^>]*src="([^"]*)"',
        r'<img[^>]*id="recipe-image"[^>]*src="([^"]*)"',
    ]
    for pattern in image_patterns:
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            img_url = match.group(1)
            return (
                urlparse(base_url)._replace(path=img_url).geturl()
                if img_url.startswith("/")
                else img_url
            )


def scrape_recipe(url):
    html = fetch_html(url)
    json_ld = extract_json_ld(html)

    return {
        "success": True,
        "data": {
            "title": extract_title(html, json_ld),
            "ingredients": extract_ingredients(html, json_ld),
            "calories": extract_calories(html, json_ld),
            "image_url": extract_image_url(html, json_ld, url),
        },
    }


def can_scrape(url):
    parsed_url = urllib.parse.urlparse(url)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}"

    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(f"{base_url}/robots.txt")
    rp.read()

    return rp.can_fetch("*", url)


def allowed_scrape(url):
    if can_scrape(url):
        return scrape_recipe(url)
        pass
    else:
        return {
            "success": False,
            "error": "Oops!This website is not allowed to be scraped. Please try another website.",
        }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide a URL to scrape as an argument")
        sys.exit(1)

    recipe_url = sys.argv[1]
    recipe_Data = allowed_scrape(recipe_url)
    print(json.dumps(recipe_Data))
