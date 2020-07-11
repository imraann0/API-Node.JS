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
const Friends = require("../models/friends");
const Challenges = require("../models/challenges");
const Chalengeusers = require("../models/challengeusers");
const { Op } = require("sequelize");
const _ = require("lodash");
const { response } = require("express");
const { QueryTypes } = require("sequelize");
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
  const userNameExists = await User.findOne({
    where: { username: req.body.username },
  });
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
    res.status(400).json({
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

router.get("/friends", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    // const user_id = 9

    if (!user_id) return res.status(400).send("user not logged in");

    // find all friends where the user id is either user_id1 or user_id2 & confirmed is set true
    Friends.findAll({
      where: {
        [Op.or]: [{ user_id1: user_id }, { user_id2: user_id }],
        [Op.and]: [{ confirmed: 1 }],
      },
    }).then((friendslist) => {
      // returns all ids
      var promise = friendslist.map((friend) => {
        var user_id1 = friend.dataValues.user_id1;
        var user_id2 = friend.dataValues.user_id2;
        return [user_id1, user_id2];
      });

      // merges the ids into one arrray
      var mergedIds = [].concat.apply([], promise);

      // removes the userid from the list
      const friendPendingIds = _.without(mergedIds, user_id);
      console.log("friends ids only", friendPendingIds);

      //finds the ids of the friends and returns to client
      User.findAll({
        where: {
          id: friendPendingIds,
        },
      }).then((friendlist) => {
        if (!friendlist || friendlist.length == 0) {
          res.status(400).send("No friends found ");
        } else {
          res.status(200).send({
            message: friendlist,
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/friends-pending", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    // const user_id = 21

    if (!user_id) return res.status(400).send("user not logged in");

    // find all pending friends where the user id is either user_id1 or user_id2 & confirmed is set true
    Friends.findAll({
      where: {
        user_id2: user_id,
        [Op.and]: [{ confirmed: 0 }],
      },
    }).then((friendslist) => {
      // returns all ids
      var promise = friendslist.map((friend) => {
        var user_id1 = friend.dataValues.user_id1;
        var user_id2 = friend.dataValues.user_id2;
        return [user_id1, user_id2];
      });

      // merges the ids into one arrray
      var mergedIds = [].concat.apply([], promise);

      //removes the userid from the list
      const friendPendingIds = _.without(mergedIds, user_id);

      //finds the ids of the pending friends and returns to client
      User.findAll({
        where: {
          id: friendPendingIds,
        },
      }).then((friendlist) => {
        if(!friendlist || friendlist.length == 0){
          res.status(400).send("No pending friends ");
      }else{
        res.status(200).json({
          friends: friendlist,
        });
      }
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/friend-request", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const friend_id = req.body.friend_id;

    if (!user_id) return res.status(400).send("user not logged in");

    //query the friends table to find where " user_id1 = user_id or user_id2 = user_id  and user_id1 = friend_id or user_id2 = friend_id "

    const requestExists = await db.query(
      "SELECT * FROM `friends` WHERE (user_id1 = " +
        user_id +
        " OR user_id2 =" +
        user_id +
        ") AND (user_id1 = " +
        friend_id +
        " OR user_id2 =" +
        friend_id +
        ") ",
      {
        type: QueryTypes.SELECT,
      }
    );

    // if no request is in db, make a new friend request

    if (!requestExists || !requestExists.length) {
      const friendRequest = new friends({
        user_id1: user_id,
        user_id2: friend_id,
        confirmed: 0,
      });
      const savedRequest = await friendRequest.save().then(function (result) {
        console.log(result);
        res.status(400).send("Request sent");
      });
    }
    // check if the users are already friends
    else if (requestExists[0].confirmed === 1) {
      res.status(400).send("Alerady friends");
    }
    // check if the user logged in is the one who made the request, if so, and they hit the same endpoint again then it will remove the request(delete the pending friend request)
    else if (requestExists[0].user_id1 === user_id) {
      Friends.destroy({
        where: {
          id: requestExists[0].id,
        },
      }).then((response) => {
        res.status(204).send("Request deleted");
      });
    }
    // if its not the logged in user then the request has already been made by another user so it will be in the users pending to accept or decline friends
    else {
      res.status(400).send("Request pending, check pending tab");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/friend-accept", async (req, res) => {
  try {
    // const user_id = req.body.id
    //const friend_id = req.body.friend_id
    const user_id = req.body.user_id;
    const friend_id = req.body.friend_id;

    if (!user_id) return res.status(400).send("user not logged in");

    // looks for the users friends pending friends list, where confirmed is 0 because user id2 is always teh user raccepting the feind request
    const friendRequested = await Friends.findOne({
      where: {
        user_id1: friend_id,
        user_id2: user_id,
        [Op.and]: [{ confirmed: 0 }],
      },
    });

    // if no friend request found then it returns the message
    if (!friendRequested)
      return res.status(400).send(" No Friend Request Exists ");

    // if friend request is found then it will update the confirmed field to 1 whitch is true
    if (friendRequested) {
      Friends.update(
        {
          confirmed: 1,
        },
        {
          where: {
            id: friendRequested.id,
          },
        }
      ).then((response) => {
        res.status(201).send("Friend accepted");
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/friend-reject", async (req, res) => {
  try {
    // const user_id = req.body.id
    //const friend_id = req.body.friend_id
    const user_id = req.body.user_id;
    const friend_id = req.body.friend_id;

    if (!user_id) return res.status(400).send("user not logged in");

    // looks for the users friends pending friends list, where confirmed is 0
    const friendRequested = await Friends.findOne({
      where: {
        user_id1: friend_id,
        user_id2: user_id,
        [Op.and]: [{ confirmed: 0 }],
      },
    });

    // if no friend request found then it returns the message
    if (!friendRequested)
      return res.status(400).send(" No Friend Request Found ");

    // if friend request is found then it will delete the request made
    if (friendRequested) {
      Friends.destroy({
        where: {
          id: friendRequested.id,
        },
      }).then((response) => {
        console.log("here")
        res.send("Request deleted");
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/unfriend", async (req, res) => {
  try {
    //const user_id = 124
    //const friend_id = req.body.friend_id

    const user_id = req.body.user_id;
    const friend_id = req.body.user_id;

    if (!user_id) return res.status(400).send("user not logged in");

    // looks for the users friends list, where confirmed is 1
    const friendExists = await db.query(
      "SELECT * FROM `friends` WHERE (user_id1 = " +
        user_id +
        " OR user_id2 =" +
        user_id +
        ") AND (user_id1 = " +
        friend_id +
        " OR user_id2 =" +
        friend_id +
        ") AND (confirmed = 1 ) ",
      {
        type: QueryTypes.SELECT,
      }
    );

    // if no friend request found then it returns the message
    if (!friendExists || !friendExists.length)
      return res.status(400).send(" friendship not found ");

    // if friends, then delete
    if (friendExists) {
      Friends.destroy({
        where: {
          id: friendExists[0].id,
        },
      }).then((response) => {
        // return res.status(204).send(" friend removed ");
        res.send("friend removed")
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/create-challenge", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const type = req.body.type;
    const content = req.body.content;
    const date = req.body.date;

    if (!user_id) return res.status(400).send("user not logged in");

    async function createChallenge() {
      const challenge = new Challenges({
        user_id,
        type,
        date,
        content,
      });
      const savedChallenge = await challenge.save().then(function (result) {
        res.status(201).send("challenge made");
        return result;
      });
      const challengeUsers = new Challengeusers({
        challenge_id: savedChallenge.dataValues.id,
        user_id,
        status: 1,
      });
      await challengeUsers.save().error(function (err) {
        console.log(err);
      });
    }

    const challengeExists = await Chalengeusers.findAll({
      where: {
        user_id,
        status: 1,
      },
    }).then((challenges) => {
      var promise = challenges.map((result) => {
        // console.log(result.challenge_id)
        return result.challenge_id;
      });

      Challenges.findAll({
        where: {
          id: promise,
        },
      }).then((challenges) => {
        var promise2 = challenges.map((challenge) => {
          return [challenge.type, challenge.date];
        });

        var mergedprom = [].concat.apply([], promise2);

        console.log(mergedprom);

        const incldues = mergedprom.includes(type && date);

        console.log(incldues);

        if (incldues === false) {
          createChallenge();
        } else {
          res.status(400).send("Already doing the same challenge on this day");
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/invite-user-challenge", async (req, res) => {
  try {
    // const user_id = req.body.id
    //const friend_id = req.body.friend_id
    const user_id = req.body.user_id;
    const friend_id = req.body.friend_id;
    const challenge_id = req.body.challenge_id;

    if (!user_id) return res.status(400).send("user not logged in");

    const ChallengeSent = await challengeusers.findOne({
      where: {
        user_id: friend_id,
        challenge_id,
      },
    });

    if (ChallengeSent == undefined || ChallengeSent.length == 0) {
      const inviteUserToChallenge = new Challengeusers({
        user_id: friend_id,
        challenge_id,
        sent_id: user_id,
        status: 0,
      });
      const savedInvte = await inviteUserToChallenge
        .save()
        .then(function (result) {
          res.status(201).send("Invite sent");
        });
    }

    // check if the users are already doing challenge
    else if (ChallengeSent.dataValues.status === 1) {
      res.status(400).send("Already doing challenge");

    }
    // check if the user logged in is the one who sent the invite request, if so, and they hit the same endpoint again then it will remove the request(delete the pending invite request)
    else if (ChallengeSent.dataValues.sent_id === user_id) {
      challengeusers
        .destroy({
          where: {
            id: ChallengeSent.id,
          },
        })
        .then((response) => {
          res.status(204).send("Invite deleted");
        });
    }
    // if its not the logged in user then the request has already been made by another user so it will be in the users pending to accept or decline friends
    else {
      res.status(400).send("Request pending, check pending tab");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/challenge-accept", async (req, res) => {
  try {
    // const user_id = req.body.id
    //const friend_id = req.body.friend_id
    const user_id = req.body.user_id;
    const friend_id = req.body.friend_id;
    const challenge_id = req.body.challenge_id;

    if (!user_id) return res.status(400).send("user not logged in");

    // looks for the challenges pending where status is 0 and user_id
    const challengeRequest = await Challengeusers.findOne({
      where: {
        user_id,
        status: 0,
        challenge_id,
      },
    });

    console.log(challengeRequest);

    // if no challenge request found then it returns the message
    if (!challengeRequest)
      return res.status(400).send(" No Challenge Requests Exists ");
    //  console.log(challengeRequest.dataValues.challenge_id)

    // if challenge request is found then it will update the confirmed field to 1 whitch is true
    if (challengeRequest) {
      Challengeusers.update(
        {
          status: 1,
        },
        {
          where: {
            id: challengeRequest.dataValues.challenge_id,
          },
        }
      ).then((response) => {
        res.status(201).send("Challenge accepted");
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/challenge-decline", async (req, res) => {
  try {
    // const user_id = req.body.id
    //const friend_id = req.body.friend_id
    const user_id = req.body.user_id;
    const friend_id = req.body.friend_id;
    const challenge_id = req.body.challenge_id;

    if (!user_id) return res.status(400).send("user not logged in");

    // looks for the challenges pending where status is 0 and user_id
    const challengeRequest = await Challengeusers.findOne({
      where: {
        user_id,
        status: 0,
        challenge_id,
      },
    });

    console.log(challengeRequest);

    // if no challenge request found then it returns the message
    if (!challengeRequest)
      return res.status(400).send(" No Challenge Requests Exists ");
    //  console.log(challengeRequest.dataValues.challenge_id)

    // if challenge request is found then it will update the confirmed field to 1 whitch is true
    if (challengeRequest) {
      challengeusers
        .destroy({
          where: {
            id: challengeRequest.dataValues.id,
          },
        })
        .then((response) => {
          res.status(204).send("Challenge declined");
        });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/challenges", async (req, res) => {
  try {
    const user_id = req.body.user_id;

    if (!user_id) return res.status(400).send("user not logged in");

    const challengeExists = await Chalengeusers.findAll({
      where: {
        user_id,
        status: 1,
      },
    }).then((challenges) => {
      var promise = challenges.map((result) => {
        // console.log(result.challenge_id)
        return result.challenge_id;
      });

      Challenges.findAll({
        where: {
          id: promise,
        },
      }).then((challenges) => {
        if (!challenges || challenges.length == 0) {
          res.status(400).send("no challenge found");
        } else {
          res.status(200).json({
            message: challenges,
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/users-in-challenge", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const challenge_id = req.body.challenge_id;

    if (!user_id) return res.status(400).send("user not logged in");

    const challengeExists = await Chalengeusers.findAll({
      where: {
        challenge_id,
      },
    }).then((usersInChallenge) => {
      var usersInChallenge = usersInChallenge.map((result) => {
        return result.dataValues.user_id;
      });

      User.findAll({
        where: {
          id: usersInChallenge,
        },
      }).then((users) => {
        if (!users || users.length == 0) {
          res.status(400).send("challenge dont exist");
        } else {
          res.status(200).json({
            message: users,
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/challenges-pending", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    // const user_id = 21

    if (!user_id) return res.status(400).send("user not logged in");

    // find all pending friends where the user id is either user_id1 or user_id2 & confirmed is set true
    Challengeusers.findAll({
      where: {
         user_id, status: 0
      },
    }).then((challengesPending) => {
      // returns all ids
      var promise = challengesPending.map((challenge) => {
        return challenge.dataValues.id
      });

      // // merges the ids into one arrray
      var challengeIds = [].concat.apply([], promise);

      console.log(challengeIds)

      //finds the ids of the pending challenes and return to client
      Challenges.findAll({
        where: {
          id: challengeIds,
        },
      }).then((challengeList) => {
        if(!challengeList || challengeList.length == 0){
          res.status(400).send("No pending challenges found");
        }else{
          res.status(200).json({
            pendingChallenges: challengeList,
          });
        }

      });

    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
