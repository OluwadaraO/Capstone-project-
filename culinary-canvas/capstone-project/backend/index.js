require('dotenv').config();

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 14;
const secretKey = process.env.JWT_SECRET_TOKEN
const app = express()
const PORT = 3000
PEXELS_API_KEY = process.env.API_KEY

app.use(cookieParser())
app.use(express.json())
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
    }
))

//to fetch a random image for users's profile
const fetchRandomProfileImage = async () => {
    try{
        const response = await fetch(`https://api.pexels.com/v1/search?query=random&per_page=1&page=${Math.floor(Math.random() * 100) + 1}`, {
            headers: {
                Authorization: PEXELS_API_KEY,
            },
        });
        const data = await response.json()
        if (!response.ok){
            throw new Error(`Error fetching data : ${data.error}`)
        }
        return data.photos[0].src.original;
    }
    catch(error){
        console.error(error);
        res.status(500).json({error: 'Failed to get image'})
    }
}

//to create a new users's account
app.post('/create', async(req, res) => {
    const {userName, name, password} = req.body;
        try{
            const existingUser = await prisma.users.findUnique({where: {userName}})
            if (existingUser){
                return res.status(400).json({message: "Oops! users already exists."})
            }
            const hashed = await bcrypt.hash(password, saltRounds);
            const imageUrl = await fetchRandomProfileImage();
            const newUserAccount = await prisma.users.create({
                data: {
                    userName,
                    name,
                    password: hashed,
                    imageUrl: imageUrl
                }
            });
            res.status(200).json(newUserAccount)
        }
        catch(error){
            console.error("Error posting data:", error);
            res.status(500).json({error: 'Failed to create new users'})
        };
})

//to log in to a users's account
app.post('/login', async(req, res) => {
    const {userName, password} = req.body;
    try{
        const userRecord = await prisma.users.findUnique({
            where : {userName},
        })
        if (!userRecord){
            return res.status(400).json({message: "Username not found. Please try again"})
        }
        const matched = await bcrypt.compare(password, userRecord.password)
        if (!matched){
            return res.status(400).json({message: "Wrong password and username please try again"})
        }
        else{
        const token = jwt.sign({id: userRecord.id}, secretKey, {expiresIn: '1h'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000,
        })

        res.status(200).json({token, userRecord})
    }
    } catch(error){
        console.error(error)
        res.status(500).json({message: "Something went wrong..."})
    }
})


app.get('/protected', async (req, res) => {
    const token = req.cookies.token;
    if (!token){
        return res.status(401).json(" No token found, authorization denied")
    }
    try{
        const decoded = jwt.verify(token, secretKey);
        const users = await prisma.users.findUnique({where :{id : decoded.id}})
       if(!users){
        res.status(401).json({message: "users not found"})
       }
       res.status(200).json(users);
    }catch(error){
        res.status(401).json("Oops! Token is not valid")
    }
})

//to log out
app.post('/logout', (req, res)=> {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json("Logged out successfully")
})

app.get('/recipes', async(req, res) => {
    const query = req.query.q || 'chicken';
    const url = `https://api.edamam.com/search?q=${query}&app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}`;

    try{
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching recipes: ${response.statusText}`);
        }
        const data = await response.json();
        const recipes = data.hits.map(hit=> hit.recipe);

        await prisma.recipe.createMany({
            data: recipes.map(recipe => ({
                title: recipe.label,
                ingredients: recipe.ingredientLines.join(','),
                url: recipe.url,
                image: recipe.image
            })),
            skipDuplicates: true
        })
        res.json(recipes);
    }catch(error){
        res.status(500).send("Error fetching recipes");
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
