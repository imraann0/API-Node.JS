const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");
const db = require("../database/db");
const User = require("../models/users");
const { registerValidation, loginValidation } = require("./validation");
const verify = require("./verifyToken");
const Location = require("../models/location");
const Freinds = require("../models/freinds");
const { Op } = require("sequelize");
const _ = require('lodash');
const users = require("../models/users");
const { response } = require("express");




router.post("/register", async (req, res) => {
  //Validate Data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if user is already in database
  const emailExists = await User.findOne({ where: { email: req.body.email } });
  if (emailExists) return res.status(400).send("Email already Exists");

    //Check if username already in exists
    const userNameExists = await User.findOne({ where: { username: req.body.username } });
    if (userNameExists) return res.status(400).send("Username already Taken");

  //Hash pasword
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Createing new User
  const user = new User({
    email: req.body.email,
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    dob: req.body.dob,
    username: req.body.username,
    password: hashedPassword,
  });
  //save the user to db & send result
  try {
    const savedUser = await user.save().then(function (result) {
      console.log(result);
      res.status(201).json({
        message: "User Created",
        // user: [result.id, result.first_name, result.last_name, result.email],
        user: result,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(201).json({
      message: "user not created",
    });
  }
});

// get user location and save in database
router.post("/location", async (req, res) => {
  console.log(req.body);

  const userExisst = await Location.findOne({
    where: {
      userId: req.body.id,
    },
  });

  if (userExisst) {
    Location.update(
      {
        long: req.body.long,
        lat: req.body.lat,
      },
      {
        where: {
          userId: req.body.id,
        },
      }
    )
      .then((responseId) => {
        res.send("updated");
        console.log("location Id!!!!!!!!!!!", responseId);
        User.update(
          {
            locationId: userExisst.dataValues.id,
          },
          {
            where: {
              id: req.body.id,
            },
          }
        );
      })
      .error(function (err) {
        console.log("location update failed !", err);
      });
  } else {
    console.log("no user found to update");
    const location = new Location({
      userId: req.body.id,
      long: req.body.long,
      lat: req.body.lat,
    });
    //save the user to db & send result
    try {
      const savedLcoation = await location.save().then(function (result) {
        res.send("new user location updated");
        console.log("new user location saved", result.dataValues);
        User.update(
          {
            locationId: result.dataValues.id,
          },
          {
            where: {
              id: result.dataValues.userId,
            },
          }
        );
      });
    } catch (error) {
      console.log(error);
      console.log("did not save new user location");
    }
  }
});

router.post("/login", async (req, res) => {
  // Validate data
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //check if the email exists in database
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) return res.status(400).send("Email does not Exists");

  // check if password is corrrect
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid Password");

  // // send user
  // res.json({ username: user })

  //created Jsonwebtoken

  const token = jwt.sign({ id: user.id }, process.env.SECRET_TOKEN);
  res.header("authToken", token).send(token);

  console.log(token);
});

router.get("/users", verify, (req, res) => {
  // get all users
  User.findAll().then((users) => {
    res.status(200).send({
      Usres: users,
    });
  });
});

router.get("/logged", async (req, res) => {
  try {
    const token = req.header("authToken");
    if (!token) {
      console.log("no token found here");
    }

    var decoded = jwt_decode(token);
    console.log(decoded.id);

    const user = await User.findOne({ where: { id: decoded.id } }).then(
      (result) => {
        res.json({
          User: result,
        });
      }
    );
  } catch (error) {
    console.log(error.message);
    console.log("invalid token");
    res.send("Invalid Token");
  }
});

router.post("/bio", async (req, res) => {
  const UpdatedBio = await User.update(
    {
      bio: req.body.bio,
    },
    {
      where: {
        id: req.body.id,
      },
    }
  ).then((response) => {
    res.json({
      updatedBio: req.body.bio,
    });
  });
});

router.get("/freinds", async (req, res) => {

  try {

    // const user_id = req.body.id
    const user_id = 8

    if (!user_id) return res.status(400).send("user not logged in");
    
    // find all freinds where the user id is either user_id1 or user_id2 & confirmed is set true 
    Freinds.findAll({
      where: { 
        [Op.or]: [{user_id1: user_id}, {user_id2: user_id}],
        [Op.and]: [{confirmed: 1}]
      }}).then((freindslist) => {

        // returns all ids 
       var promise =  freindslist.map((freind)=> {

          var user_id1 = freind.dataValues.user_id1
          var user_id2 = freind.dataValues.user_id2
          return [user_id1, user_id2]

        })

        // merges the ids into one arrray and removes the userid from the list 
        var mergedIds = [].concat.apply([], promise);

        const freindIds = _.without(mergedIds, user_id);
        console.log("freinds ids only", freindIds);

        //finds the ids of the freinds and returns to client
        User.findAll({
          where: {
            id: freindIds
          }
        }).then((freindlist)=> {

        res.status(200).send({
        Freinds: freindlist,
      });

        })

    });

  } catch (error) {

    console.log(error)
    
  }

});

router.post("/freind-request", async (req, res) => {
  try {

    // const user_id = req.body.id
    //const freind_id = req.body.freind_id
    const user_id = req.body.id
    const freind_id = req.body.freind_id
    console.log(req.body)

    if (!user_id) return res.status(400).send("user not logged in");

    const freindRequest = new Freinds({
      user_id1: user_id,
      user_id2: freind_id,
      confirmed: 0
    });

    const savedRequest = await freindRequest.save().then(function (result) {
      console.log(result);
      res.status(201).json({
        message: "Request Sent",
      });
    });




    





  } catch (error) {

    console.log(error)
    
  }

});




module.exports = router;
