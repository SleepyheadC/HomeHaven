import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt  from 'jsonwebtoken';


export const signup  = async (req, res, next) =>{
    const {username, email, password} = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({username, email, password: hashedPassword});

    // if we try to enter the same mail again because we have declared that the email should be unique
    // then it should be showing internal error in insomnia
    
    try{
        await newUser.save();
        res.status(201).json('User created successfully');
    }
    // tracking the error 
    catch(error){
        next(error);
    }
    
}; 

export const signin = async (req, res, next) => {
    const {email, password} = req.body;
    try{
        const validUser = await User.findOne({email});
        if(!validUser) return next(errorHandler(404, 'User not found'));
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if(!validPassword) return next(errorHandler(401, 'Wong Credentials!'));
        const token = jwt.sign({id:validUser._id}, process.env.JWT_SECRET);

        // separating rest of the information and password from the user
        const { password: pass, ...rest } = validUser._doc;
        res.cookie('access_token', token, {httpOnly:true}).status(200).json(rest);
    }
    catch(error){
        next(error);
    }
};