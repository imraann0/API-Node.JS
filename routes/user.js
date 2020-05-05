const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const jwt_decode = require('jwt-decode')
const bcrypt = require('bcrypt')
const db = require('../database/db')
const User = require('../models/users')
const { registerValidation, loginValidation } = require('./validation')
const verify = require('./verifyToken')
const Location = require('../models/location')
const fs = require('fs')
const multer = require('multer')
// const test = require("../uploads")

router.post('/register', async (req, res) => {
  //Validate Data
  const { error } = registerValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  //Check if user is already in database
  const emailExists = await User.findOne({ where: { email: req.body.email } })
  if (emailExists) return res.status(400).send('Email already Exists')

  //Hash pasword
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(req.body.password, salt)

  // Createing new User
  const user = new User({
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    password: hashedPassword
  })
  //save the user to db & send result
  try {
    const savedUser = await user.save().then(function (result) {
      console.log(result)
      res.status(201).json({
        message: 'User Created',
        user: [result.id, result.first_name, result.last_name, result.email]
      })
    })
  } catch (error) {
    console.log(error)
    res.status(201).json({
      message: 'user not created'
    })
  }
})

router.post('/location', async (req, res) => {
  console.log(req.body)

  const userExisst = await Location.findOne({
    where: {
      userId: req.body.id
    }
  })

  if (userExisst) {
    Location.update(
      {
        long: req.body.long,
        lat: req.body.lat
      },
      {
        where: {
          userId: req.body.id
        }
      }
    )
      .then(responseId => {
        res.send('updated')
        console.log('location Id!!!!!!!!!!!', responseId)
        User.update(
          {
            locationId: userExisst.dataValues.id
          },
          {
            where: {
              id: req.body.id
            }
          }
        )
      })
      .error(function (err) {
        console.log('location update failed !', err)
      })
  } else {
    console.log('no user found to update')
    const location = new Location({
      userId: req.body.id,
      long: req.body.long,
      lat: req.body.lat
    })
    //save the user to db & send result
    try {
      const savedLcoation = await location.save().then(function (result) {
        res.send('new user location updated')
        console.log('new user location saved', result.dataValues)
        User.update(
          {
            locationId: result.dataValues.id
          },
          {
            where: {
              id: result.dataValues.userId
            }
          }
        )
      })
    } catch (error) {
      console.log(error)
      console.log('did not save new user location')
    }
  }
})

router.post('/login', async (req, res) => {
  // Validate data
  const { error } = loginValidation(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  //check if the email exists in database
  const user = await User.findOne({ where: { email: req.body.email } })
  if (!user) return res.status(400).send('Email does not Exists')

  // check if password is corrrect
  const validPassword = await bcrypt.compare(req.body.password, user.password)
  if (!validPassword) return res.status(400).send('Invalid Password')

  // // send user
  // res.json({ username: user })

  //created Jsonwebtoken

  const token = jwt.sign({ id: user.id }, process.env.SECRET_TOKEN)
  res.header('authToken', token).send(token)

  console.log(token)
})

router.get('/users', verify, (req, res) => {
  // get all users
  User.findAll().then(users => {
    res.status(200).send({
      Usres: users
    })
  })
})

router.get('/logged', async (req, res) => {
  try {
    const token = req.header('authToken')
    if (!token) {
      console.log('no token found here')
    }

    var decoded = jwt_decode(token)
    console.log(decoded.id)

    router.post('/bio', async (req, res) => {
      const UpdatedBio = await User.update(
        {
          bio: req.body.bio
        },
        {
          where: {
            id: req.body.id
          }
        }
      ).then(response => {
        res.json({
          updatedBio: req.body.bio
        })
      })
    })

    router.get('/logout', async (req, res) => {
      res.send('Logged out')
    })

    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, './uploads/')
      },
      filename: function (req, file, cb) {
        cb(null, file.originalname)
      }
    })

    const fileFilter = (req, file, cb) => {
      // reject file

      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
      } else {
        cb(new Error('error'), null, true)
      }
    }
    var upload = multer({
      storage: storage,
      limits: {
        fileSize: 1024 * 1024 * 5
      },
      fileFilter: fileFilter
    })

    router.post('/upload', upload.single('userImage'), async (req, res) => {
      try {
        res.send(req.file)
      } catch (err) {
        res.send(400)
      }

      console.log(req.file.path)

      const filepath = req.file.path

      const user = await User.findOne({ where: { id: req.body.id } })

      if (user) {
        await User.update(
          {
            displayPic: filepath
          },
          {
            where: {
              id: req.body.id
            }
          }
        )
      }
    })

    // router.get('/image',async (req, res) => {

    //     try {
    //         const token = req.header("authToken")
    //         if(!token) {
    //             console.log("no token found here")
    //         }

    //         var decoded = jwt_decode(token);
    //         console.log(decoded.id)

    //         const user = await
    //             User.findOne(
    //             { where:
    //                 {id: decoded.id}
    //             }).then(result => {
    //                 res.json({
    //                     User: result
    //                 })
    //         })
    //     }catch (error) {

    //         console.log(error.message)
    //         console.log("invalid token")
    //         res.send("Invalid Token")
    //     }

    // })

    const user = await User.findOne({ where: { id: decoded.id } }).then(
      result => {
        res.json({
          User: result
        })
      }
    )
  } catch (error) {
    console.log(error.message)
    console.log('invalid token')
    res.send('Invalid Token')
  }
})

module.exports = router