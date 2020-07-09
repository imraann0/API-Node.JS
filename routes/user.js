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
const Challenges = require("../models/challenges");
const Chalengeusers = require("../models/challengeusers");
const { Op } = require("sequelize");
const _ = require('lodash');
// const users = require("../models/users");
const { response } = require("express");
const { QueryTypes } = require('sequelize');
const challenges = require("../models/challenges");
const Challengeusers = require("../models/challengeusers");
const { json } = require("body-parser");
const challengeusers = require("../models/challengeusers");
const { escapeRegExp } = require("lodash");


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

    const user_id = req.body.user_id
    // const user_id = 9

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

        // merges the ids into one arrray  
        var mergedIds = [].concat.apply([], promise);

        // removes the userid from the list
        const freindPendingIds = _.without(mergedIds, user_id);
        console.log("freinds ids only", freindPendingIds);

        //finds the ids of the freinds and returns to client
        User.findAll({
          where: {
            id: freindPendingIds
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

router.get("/freinds-pending", async (req, res) => {

  try {

    const user_id = req.body.user_id
    // const user_id = 21

    if (!user_id) return res.status(400).send("user not logged in");
    
    // find all pending freinds where the user id is either user_id1 or user_id2 & confirmed is set true 
    Freinds.findAll({
      where: { 
        user_id2: user_id,
        [Op.and]: [{confirmed: 0}]
      }}).then((freindslist) => {

        // returns all ids 
       var promise =  freindslist.map((freind)=> {

          var user_id1 = freind.dataValues.user_id1
          var user_id2 = freind.dataValues.user_id2
          return [user_id1, user_id2]

        })

        // merges the ids into one arrray  
        var mergedIds = [].concat.apply([], promise);

        //removes the userid from the list
        const freindPendingIds = _.without(mergedIds, user_id);
        console.log("freinds ids only", freindPendingIds);

        //finds the ids of the pending freinds and returns to client
        User.findAll({
          where: {
            id: freindPendingIds
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
    const user_id = req.body.user_id
    const freind_id = req.body.freind_id


    if (!user_id) return res.status(400).send("user not logged in");

    //query the Freinds table to find where " user_id1 = user_id or user_id2 = user_id  and user_id1 = freind_id or user_id2 = freind_id " 

      const requestExists = await db.query('SELECT * FROM `Freinds` WHERE (user_id1 = '+user_id+' OR user_id2 ='+user_id+') AND (user_id1 = '+freind_id+' OR user_id2 ='+freind_id+') ', {
        type: QueryTypes.SELECT
      });

    // if no request is in db, make a new freind request 

      if (!requestExists || !requestExists.length) {

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
      }
      // check if the users are already freinds 
     else if(requestExists[0].confirmed === 1){
        res.status(400).json({
          message: "Already Freinds",
        });
      }
      // check if the user logged in is the one who made the request, if so, and they hit the same endpoint again then it will remove the request(delete the pending freind request)
      else if(requestExists[0].user_id1 === user_id){
        Freinds.destroy({
          where: {
              id: requestExists[0].id
          }
      }).then((response) => {
        res.status(201).json({
          message: "Request deleted",
        });
      }) 
    }
    // if its not the logged in user then the request has already been made by another user so it will be in the users pending to accept or decline freinds
          else{
          res.status(201).json({
            message: "Request pending, accept or delete",
          });
        }

  } catch (error) {

    console.log(error)
    
  }

});

router.post("/freind-accept", async (req, res) => {
  try {
    // const user_id = req.body.id
    //const freind_id = req.body.freind_id
    const user_id = req.body.user_id
    const freind_id = req.body.freind_id

    if (!user_id) return res.status(400).send("user not logged in");

    // looks for the users freinds pending freinds list, where confirmed is 0 because user id2 is always teh user raccepting the feind request
    const freindRequested = await Freinds.findOne({ 
      where: { 
        user_id1: freind_id, user_id2: user_id ,
        [Op.and]: [{confirmed: 0}],
      }
    });

    // if no freind request found then it returns the message 
    if (!freindRequested) return res.status(400).send(" No Freind Request Exists ");

    // if freind request is found then it will update the confirmed field to 1 whitch is true 
    if (freindRequested) {
      Freinds.update(
        {
          confirmed: 1,
        },
        {
          where: {
            id: freindRequested.id,
          },
        }
      ).then((response)=>{
        res.status(201).json({
          message: "Freind Accepted",
        });
      })
    }

  } catch (error) {

    console.log(error)
    
  }

});

router.post("/freind-reject", async (req, res) => {
  try {
    // const user_id = req.body.id
    //const freind_id = req.body.freind_id
    const user_id = req.body.user_id
    const freind_id = req.body.freind_id

    if (!user_id) return res.status(400).send("user not logged in");

    // looks for the users freinds pending freinds list, where confirmed is 0 
    const freindRequested = await Freinds.findOne({ 
      where: { 
        user_id1: freind_id, user_id2: user_id ,
        [Op.and]: [{confirmed: 0}],
      }
    });

    // if no freind request found then it returns the message 
    if (!freindRequested) return res.status(400).send(" No Freind Request Found ");

    // if freind request is found then it will delete the request made 
    if (freindRequested) {
      Freinds.destroy({
        where: {
            id: freindRequested.id
        }
    }).then((response)=>{
        res.status(201).json({
          message: "Freind Request Rejected",
        });
      })
    }

  } catch (error) {

    console.log(error)
    
  }

});

router.post("/unfreind", async (req, res) => {
  try {
    //const user_id = 124
    //const freind_id = req.body.freind_id
    
    const user_id = req.body.user_id
    const freind_id = req.body.user_id

    if (!user_id) return res.status(400).send("user not logged in");

      // looks for the users freinds list, where confirmed is 1
    const freindExists = await db.query('SELECT * FROM `Freinds` WHERE (user_id1 = '+user_id+' OR user_id2 ='+user_id+') AND (user_id1 = '+freind_id+' OR user_id2 ='+freind_id+') AND (confirmed = 1 ) ', {
      type: QueryTypes.SELECT
    });

    // if no freind request found then it returns the message 
    if (!freindExists || !freindExists.length) return res.status(400).send(" Freindship not found ");

    // if friends, then delete
    if (freindExists ) {
      Freinds.destroy({
        where: {
            id: freindExists[0].id
        }
    })
    .then((response)=>{
        res.status(201).json({
          message: "Freind Removed",
        });
      })
    }
  

  } catch (error) {

    console.log(error)
    
  }

});

router.post("/create-challenge", async (req, res) => {
  try {
    const user_id = req.body.user_id
    const freind_id = req.body.freind_id
    const type = req.body.type
    const content = req.body.content
    const date = req.body.date


    if (!user_id) return res.status(400).send("user not logged in");

      async function createChallenge() { 

        const challenge = new Challenges({
          user_id, type, date, content, 
        });
        const savedChallenge = await challenge.save().then(function (result) {
          // res.status(201).json({
          //   message: "Challenge Made",
          // });
          res.end("Challenge Created")
          return result
        })
        const challengeUsers = new Challengeusers({
          challenge_id: savedChallenge.dataValues.id , user_id, status: 1, 
        });
        await challengeUsers.save().error(function (err) {
          console.log(err);
        });

      } 

      // async function checkChallenge() {

      // const challengeExists = await Chalengeusers.findAll({ 
      //   where: { 
      //     user_id, status: 1     
      //    }
      // });
        
      //   if (challengeExists[0].id){

      //   challengeExists.map((existingChallenges) =>{
      //     challngeInfo = Challenges.findAll({
      //       where: {
      //         id: existingChallenges.challenge_id
      //       }
      //     }).then((result)=>{
      //       if((result[0].dataValues.type === type) && (result[0].dataValues.date === date)){
      //         res.end("Challenge already taking place on that day");
      //         return
      //       }
      //     })
      //   })
      // }

      // }

      // checkChallenge()

      //......................................................................


        challengeExists = await Chalengeusers.findAll({ 
        where: { 
          user_id, status: 1     
         }
      }).then((challenges)=>{

        var promise = challenges.map((result)=>{

          // console.log(result.challenge_id)
          return result.challenge_id
      }) 

      Challenges.findAll({
        where: {
          id: promise
        }
      }).then((challenges)=>{

        var promise2 = challenges.map((challenge)=>{
         return [challenge.type, challenge.date]

        })

        // console.log(promise2)

        var mergedprom = [].concat.apply([], promise2);

        console.log(mergedprom)

        const incldues = mergedprom.includes(type && date)

        console.log(incldues)

        if(incldues === false){
          createChallenge()
        }
        else {
          res.status(201).json({
            message: "Already doing the same challenge on this day",
          });
          
        }

        





    


       




        




        

        
      })
      

    })


      // Freinds.findAll({
      //   where: { 
      //     [Op.or]: [{user_id1: user_id}, {user_id2: user_id}],
      //     [Op.and]: [{confirmed: 1}]
      //   }}).then((freindslist) => {
  
      //     // returns all ids 
      //    var promise =  freindslist.map((freind)=> {
  
      //       var user_id1 = freind.dataValues.user_id1
      //       var user_id2 = freind.dataValues.user_id2
      //       return [user_id1, user_id2]
  
      //     })


    



  


      // const challengeExists = await Chalengeusers.findAll({ 
      //   where: { 
      //     user_id, status: 1     
      //    }
      // });

      //   if (challengeExists[0].id){
      //   challengeExists.map((existingChallenges) =>{
      //     challngeInfo = Challenges.findAll({
      //       where: {
      //         id: existingChallenges.challenge_id
      //       }
      //     }).then((result)=>{
      //       if((result[0].dataValues.type === type) && (result[0].dataValues.date === date)){
      //         res.end("Challenge already taking place on that day");
      //       }
      //     })
      //   })
      // }





    

  } catch (error) {

    console.log(error)
    
  }

});




router.post("/add-user-challenge", async (req, res) => {
  try {

    // const user_id = req.body.id
    //const freind_id = req.body.freind_id
    const user_id = req.body.user_id
    const freind_id = req.body.freind_id
    const challenge_id = req.body.challenge_id
    const content = req.body.content

    if (!user_id) return res.status(400).send("user not logged in");

    console.log(freind_id)

      const createUsersChallengeFreinds = new Challengeusers({
        user_id: freind_id,
        challenge_id,
        status: 0
      })

      const savedUsersChallengeFreinds = await createUsersChallengeFreinds.save()
    
  } catch (error) {

    console.log(error)
    
  }

});












module.exports = router;
