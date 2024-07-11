require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fs = require('fs')
const path = require('path')

const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const multer = require('multer')
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const CLOUDINARY_NAME = process.env.CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const ClOUDINARY_API_SECRET = process.env.CLOUDINARY_SECRET

const saltRounds = 14;
const secretKey = process.env.JWT_SECRET_TOKEN
const app = express()
const PORT = 3000

const RECIPE_FILE_PATH = path.join(__dirname, 'recipeOfTheDay.json')
PEXELS_API_KEY = process.env.API_KEY
EDAMAM_APP_ID = process.env.EDAMAM_API_ID_2
EDAMAM_APP_KEY = process.env.EDAMAM_API_KEY_2
app.use(cookieParser())
app.use(express.json())
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
    }
))

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: ClOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pictures',
        allowed_formats: ['jpg', 'png'],
    },
});
const upload = multer({ storage: storage })

app.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
    const { userId } = req.body;

    if (!req.file || !userId) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        const updatedUser = await prisma.users.update({
            where: { id: parseInt(userId) },
            data: { imageUrl: req.file.path },
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating profile picture: ', error);
        res.status(500).json({ error: 'Failed to update profile picture' })
    }
})

const readRecipeOfTheDay = () => {
    if (fs.existsSync(RECIPE_FILE_PATH)) {
        const data = fs.readFileSync(RECIPE_FILE_PATH, 'utf-8')
        return JSON.parse(data);
    } else {
        return null;
    }

};

const writeRecipeOfTheDay = (recipe) => {
    const data = JSON.stringify(recipe, null, 2)
    fs.writeFileSync(RECIPE_FILE_PATH, data)
}

//to fetch a random image for users's profile
const fetchRandomProfileImage = async () => {
    try {
        const response = await fetch(`https://api.pexels.com/v1/search?query=random&per_page=1&page=${Math.floor(Math.random() * 100) + 1}`, {
            headers: {
                Authorization: PEXELS_API_KEY,
            },
        });
        const data = await response.json()
        if (!response.ok) {
            throw new Error(`Error fetching data : ${data.error}`)
        }
        return data.photos[0].src.original;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to get image' })
    }
}

//to create a new users's account
app.post('/create', upload.single('profilePicture'), async (req, res) => {
    const { userName, name, password } = req.body;
    try {
        const existingUser = await prisma.users.findUnique({ where: { userName } })
        if (existingUser) {
            return res.status(400).json({ message: "Oops! users already exists." })
        }
        const hashed = await bcrypt.hash(password, saltRounds);
        let imageUrl;
        if (req.file) {
            imageUrl = req.file.path
        }
        else if (!req.file) {
            imageUrl = await fetchRandomProfileImage();
        }
        const newUserAccount = await prisma.users.create({
            data: {
                userName,
                name,
                password: hashed,
                imageUrl: imageUrl
            }
        });
        const token = jwt.sign({id : newUserAccount.id}, secretKey, {expiresIn: '24h'})
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 86400000,
        })
        res.status(200).json({token, newUserAccount})
    }
    catch (error) {
        console.error("Error posting data:", error);
        res.status(500).json({ error: 'Failed to create new users' })
    };
})

//to log in to a users's account
app.post('/login', async (req, res) => {
    const { userName, password } = req.body;
    try {
        const userRecord = await prisma.users.findUnique({
            where: { userName },
        })
        if (!userRecord) {
            return res.status(400).json({ message: "Username not found. Please try again" })
        }
        const matched = await bcrypt.compare(password, userRecord.password)
        if (!matched) {
            return res.status(400).json({ message: "Wrong password and username please try again" })
        }
        else {
            res.clearCookie('token')
            const token = jwt.sign({ id: userRecord.id }, secretKey, { expiresIn: '24h' })
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 86400000,
            })

            res.status(200).json({ token, userRecord })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Something went wrong..." })
    }
})


app.get('/protected', async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json(" No token found, authorization denied")
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        const users = await prisma.users.findUnique({ where: { id: decoded.id } })
        if (!users) {
            res.status(401).json({ message: "users not found" })
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(401).json("Oops! Token is not valid")
    }
})

//to log out
app.post('/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json("Logged out successfully")
})

//get user's account
app.get('/login/:id', async (req, res) => {
    const { id } = req.params
    const user = await prisma.users.findUnique(
        {
            where: { id: parseInt(id) }
        });
    res.json(user)
})

//get recipes and the likes in the recipe
app.get('/recipes', async (req, res) => {
    const category = req.query.category || '';
    const health = req.query.health || '';
    let url = `https://api.edamam.com/search?&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`;

    if (category) {
        url += `&q=${category}`
    }
    if (health) {
        url += `&health=${health}`
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        const recipeIds = await data.hits.map(hit => hit.recipe.uri);
        const likes = await prisma.likedRecipe.groupBy({
            by: ['recipeId'],
            _count: {
                recipeId: true,
            },
            where: {
                recipeId: {
                    in: recipeIds,
                },
            },
        });
        const likesMap = likes.reduce((acc, like) => {
            acc[like.recipeId] = like._count.recipeId;
            return acc;
        }, {})
        data.hits.forEach(hit => {
            hit.likes = likesMap[hit.recipe.uri] || 0;
        });

        return res.json(data.hits)
    }
    catch (error) {
        res.status(500).json(error)
    }
})

const fetchRandomRecipe = async () => {
    const categories = ['chicken', 'beef', 'fish', 'rice', 'cookies', 'cheese', 'salad', 'beans', 'stew', 'egg', 'fish', 'pork', 'lettuce', 'mango', 'yam', 'potatoes', 'turkey', 'tomatoes', 'spaghetti', 'pasta']
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const url = `https://api.edamam.com/search?q=${randomCategory}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}`
    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        else {
            const data = await response.json()
            const recipes = data.hits
            if (recipes.length > 0) {
                const randomRecipe = recipes[Math.floor(Math.random() * recipes.length)].recipe;
                return randomRecipe
            } else {
                throw new Error('No recipes found!')
            }
        }
    } catch (error) {
        console.error('Error fetching recipe from Edamam: ', error)
        throw error
    }
}

app.get('/recipe-of-the-day', async (req, res) => {
    try {
        let recipeOfTheDay = await readRecipeOfTheDay();
        const currentTime = new Date().getTime();
        if (!recipeOfTheDay || currentTime - new Date(recipeOfTheDay.timestamp).getTime() > 24 * 60 * 60 * 1000) {
            const randomRecipe = await fetchRandomRecipe();

            recipeOfTheDay = {
                ...randomRecipe, timestamp: new Date().toISOString()
            };
            writeRecipeOfTheDay(recipeOfTheDay)
        }
        res.json(recipeOfTheDay)
    } catch (error) {
        return res.status(500).json(error)
    }
})

//to like a recipe
app.post('/recipes/like', async (req, res) => {
    const { userId, recipeId, recipeName, recipeImage } = req.body;
    try {
        const likedRecipe = await prisma.likedRecipe.create({
            data: {
                userId,
                recipeId,
                recipeName,
                recipeImage
            }
        });
        res.json(likedRecipe)
    }
    catch (error) {
        res.status(500).json(error)
    }
})

app.post('/save-preferences', async (req, res) => {
    const { userId, cookingLevel, dietaryPreferences = [], favoriteFoods = [] } = req.body;
    try {
        const userPreferences = await prisma.userPreferences.create({
            data: {
                userId: parseInt(userId),
                cookingLevel,
                dietaryPreferences,
                favoriteFoods
            }
        });
        res.status(200).json(userPreferences)
    } catch (error) {
        console.error('Error saving user preferences: ', error)
        res.status(500).json({ error: 'Failed to save user preferences: ' })
    }
});

app.put('/update-preferences', async (req, res) => {
    const { userId, cookingLevel, dietaryPreferences = [], favoriteFoods = [] } = req.body;
    try {
        const userPreferences = await prisma.userPreferences.upsert({
            where: { userId },
            update: {
                cookingLevel,
                dietaryPreferences,
                favoriteFoods
            },
            create: {
                userId,
                cookingLevel,
                dietaryPreferences,
                favoriteFoods
            }
        });
        res.status(200).json(userPreferences)
    } catch (error) {
        console.error('Error updating user preferences: ', error)
        res.status(500).json({ error: 'Failed to update user preferences' })
    }
})

app.get('/preferences/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const preferences = await prisma.userPreferences.findUnique({
            where: {
                userId: parseInt(userId)
            }
        })
        res.status(200).json(preferences || { cookingLevel: '', dietaryPreferences: [], favoriteFoods: [] })
    } catch (error) {
        console.error('Error fetching user preferences: ', error)
        res.status(500).json({ error: 'Failed to fetch user preferences' })
    }
})

//to unlike a recipe
app.delete('/recipes/unlike', async (req, res) => {
    const { userId, recipeId } = req.body;
    try {
        const deletedRecipe = await prisma.likedRecipe.deleteMany({
            where: {
                userId,
                recipeId
            },
        });
        res.json(deletedRecipe)
    } catch (error) {
        res.status(500).json(error)
    }
})

//to get all the recipes a user has liked
app.get('/recipes/liked/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const likedRecipes = await prisma.likedRecipe.findMany({
            where: {
                userId: parseInt(userId)
            }
        });
        res.json(likedRecipes)
    } catch (error) {
        console.error('error fetching liked recipes', error)
        res.status(500).json(error)
    }
})


//save a recipe
app.post('/recipes/saved', async (req, res) => {
    const { userId, recipeId, recipeName, recipeImage } = req.body;
    try {
        const savedRecipe = await prisma.savedRecipe.create({
            data: {
                userId,
                recipeId,
                recipeName,
                recipeImage
            }
        });
        res.json(savedRecipe)
    } catch (error) {
        console.error('Error liking Recipe', error)
        res.status(500).json(error)
    }
})

//to remove a recipe from saved
app.delete('/recipes/unsaved', async (req, res) => {
    const { userId, recipeId } = req.body;
    try {
        const deletedRecipe = await prisma.savedRecipe.deleteMany({
            where: {
                userId,
                recipeId
            }
        });
        res.json(deletedRecipe)
    } catch (error) {
        console.error('error unliking recipes', error)
        res.status(500).json(error)
    }
});

//to get the all the recipes a user has saved
app.get('/recipes/save/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const savedRecipe = await prisma.savedRecipe.findMany({
            where: {
                userId: parseInt(userId)
            }
        });
        res.json(savedRecipe)
    } catch (error) {
        console.error('error fetching liked recipes', error)
        res.status(500).json(error)
    }
})

//to add a grocery item to a user's dashboard
app.post('/grocery', async (req, res) => {
    const { userId, itemName, quantity } = req.body;
    try {
        const newItem = await prisma.groceryList.create({
            data: {
                userId,
                itemName,
                quantity
            }
        });
        res.json(newItem)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add grocery item' })
    }
})

//to get all the items in a user's dashboard
app.get('/grocery/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const items = await prisma.groceryList.findMany({
            where: {
                userId: parseInt(userId),
            }
        });
        res.json(items)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch grocery items' })
    }
})

//to update a particular grocery item
app.put('/grocery/:id', async (req, res) => {
    const { id } = req.params;
    const { itemName, quantity } = req.body;
    try {
        const updatedItem = await prisma.groceryList.update({
            where: { id: parseInt(id) },
            data: {
                itemName,
                quantity,
            },
        });
        res.json(updatedItem)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to update grocery List` })
    }
})

// to delete a particular grocery item
app.delete('/grocery/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedItem = await prisma.groceryList.delete({
            where: { id: parseInt(id) },
        });
        res.json(deletedItem)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Failed to delete grocery item` })
    }
})

app.post('/recommendations', async (req, res) => {
    const { ingredients } = req.body;
    try {
        const searchQueries = ingredients.join(', ');
        let url = `https://api.edamam.com/search?&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&q=${searchQueries}`;
        const response = await fetch(url);
        const data = await response.json();
        const recipes = data.hits.map(hit => ({
            id: hit.recipe.uri,
            label: hit.recipe.label,
            image: hit.recipe.image,
            source: hit.recipe.source,
            url: hit.recipe.url,
        }));
        res.json(recipes)
    } catch (error) {
        console.error('Error fetching recommendations: ', error);
        res.status(500).json({ error: 'Failed to fetch recommendations' })
    }
})

app.post('/recipes/rate', async (req, res) => {
    const { userId, recipeId, rating } = req.body;
    try {
        const existingRating = await prisma.rating.findUnique({
            where: {
                userId_recipeId: { userId, recipeId }
            }
        })
        if (existingRating) {
            await prisma.rating.update({
                where: {
                    userId_recipeId: { userId, recipeId }
                },
                data: {
                    rating
                }
            });
        } else {
            await prisma.rating.create({
                data: {
                    userId,
                    recipeId,
                    rating
                }
            });
        }
        const ratings = await prisma.rating.findMany({
            where: { recipeId }
        });
        const averageRating = ratings.length ? ratings.reduce((acc, { rating }) => acc + rating, 0) / ratings.length : 0;
        res.json({ averageRating })
    } catch (error) {
        console.error('Error fetching recipe: ', error)
        res.status(500).json({ error: 'Failed to rate recipe' })
    }
});

app.get('/recipes/:recipeId/ratings', async (req, res) => {
    const { recipeId } = req.params;
    try {
        const ratings = await prisma.rating.findMany({
            where: { recipeId }
        });
        const averageRating = ratings.length ? ratings.reduce((acc, { rating }) => acc + rating, 0) / ratings.length : 0;
        res.json({ ratings, averageRating })
    } catch (error) {
        console.error('Error fetching ratings: ', error);
        res.status(500).json({ error: 'Failed to fetch ratings' })
    }
})

app.get('/recipes/:recipeId/user-rating', async (req, res) => {
    const { recipeId } = req.params;
    const { userId } = req.query;
    try {
        const userRating = await prisma.rating.findUnique({
            where: {
                userId_recipeId: { userId: parseInt(userId), recipeId }
            }
        });
        res.json({ rating: userRating ? userRating.rating : 0 })
    } catch (error) {
        console.error('Error fetching user rating: ', error)
        res.status(500).json('Failed to fetch', error)
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
