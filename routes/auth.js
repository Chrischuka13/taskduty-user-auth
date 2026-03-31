import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/taskUser.js"

const router = express.Router()

router.post('/auth/signup', async (req, res) => {
    try {
        const {username, email, password} = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // check for existing user
        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(400).json({message: "email is already registered"})
        }
        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        // create user
        const user =  new User({
        username,
        email,
        password: hashPassword,
        })
        await user.save()
        
        res.status(201).json({
            message: "user created successfully",
            user: {id: user._id, username: user.username, email: user.email}
        })

    } catch (err) {
        console.error("SignUp API error", err.message);
        res.status(500).json({message: "server error"})
        
    }
});

router.post("/auth/login", async(req, res) =>{
    try {
        const {email, password} = req.body
        
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message: "User does not exist"})
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({message: "Email or password is wrong"})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: "1h"})

        //enables secure cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        })

        res.status(200).json({
            message: "User login successfully",
            user: {id: user._id, email: user.email}
        })


    } catch (err) {
        console.error("Login API error", err.message);
        res.status(500).json({message: "server error"})
    }
})


export default router;