require('dotenv').config()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const cors = require('cors')
const express = require('express')
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET_TOKEN
const saltRounds = 14;
const PORT = 3000
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session);
const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
    }
))

//to create a new user's account
app.post('/create', async(req, res) => {
    const {userName, name, password} = req.body;
        try{
            const existingUser = await prisma.user.findUnique({where: {userName}})
            if (existingUser){
                return res.status(400).json("Oops! User already exists.")
            }
            const hashed = await bcrypt.hash(password, saltRounds);
            const newUserAccount = await prisma.user.create({
                data: {
                    userName,
                    name,
                    password: hashed
                }
            });
            res.status(200).json(newUserAccount)
        }
        catch(error){
            console.error("Error posting data:", error);
            res.status(500).json({error: 'Failed to create new user'})
        };
})

//to log in to a user's account
app.post('/login', async(req, res) => {
    const {userName, password} = req.body;
    try{
        const userRecord = await prisma.user.findUnique({
            where : {userName}
        })
        if (!userRecord){
            return res.status(400).json("Username not found. Please try again")
        }
        const matched = bcrypt.compare(password, userRecord.password)
        if (!matched){
            return res.status(400).json("Wrong password and username please try again")
        }
        const token = jwt.sign({id: userRecord.id}, secretKey, {expiresIn: '1h'})

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000,
        })
        res.status(200).json({token, userRecord})
    } catch(error){
        res.status(500).json("Something went wrong...")
    }
})


app.get('/protected', async (req, res) => {
    const token = req.cookies.token;
    if (!token){
        return res.status(200).json(" No token found, authorization denied")
    }
    try{
        const decoded = jwt.verify(token, secretKey);
        const user = await prisma.user.findUnique({where :{id : decoded.id}})
       if(!user){
        res.status(401).json("user not found")
       }
       res.status(200).json(user);
    }catch(error){
        res.status(401).json("Oops! Token is not valid")
    }
})


app.post('/logout', (req, res)=> {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json("Logged out successfully")
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
