// const express = require('express');
// const router = express.Router();
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');
// const db = require('../database/db');
// const User= require('../models/users');
// const {registerValidation, loginValidation} = require('./validation');
// const verify = require('./verifyToken');


// router.post('/register', async (req, res) => {

//     //Validate Data 
//     const {error} = registerValidation(req.body);
//     if(error) return res.status(400).send(error.details[0].message)

//     //Check if user is already in database 
//     const emailExists = await User.findOne({ where: {email: req.body.email}});
//     if (emailExists) return res.status(400).send('Email already Exists')

//     //Hash pasword 
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
//     // Createing new User 
//     const user = new User ({

//         email: req.body.email,
//         first_name:  req.body.first_name,
//         last_name: req.body.last_name,
//         password: hashedPassword 
    
//     });
// //save the user to db & send result 
//     try {
//         const savedUser = await user.save()
//         .then(function(result){
//             console.log(result);
//             res.status(201).json({
//                 message: "User Created",
//                 user: [result.id, result.first_name, result.last_name, result.email] 
//             });
//         });    
//     } catch (error) {
//         console.log(error);
//         res.status(201).json({
//             message: "user not created"
//         });
//     }

// });


// router.post('/login', async (req, res) => {

//     // Validate data 
//     const {error} = loginValidation(req.body);
//     if(error) return res.status(400).send(error.details[0].message)

//     //check if the email exists in database
//     const user = await User.findOne({ where: {email: req.body.email}});
//     if (!user) return res.status(400).send('Email does not Exists')

//     // check if password is corrrect 
//     const validPassword = await bcrypt.compare(req.body.password, user.password)
//     if (!validPassword) return res.status(400).send('Invalid Password')

// //created Jsonwebtoken 

// const token = jwt.sign({id: user.id}, process.env.SECRET_TOKEN);
// res.header('authToken', token).send(token);
 
//     // res.send('logged in');

// });




// router.get ('/users', verify, (req, res) => {
// // get all users 
//     User.findAll()
//     .then(users => {
//         res.status(200).send({
//             Usres: users
//         });
//     });

// });

// module.exports = router;

