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
const { Op } = require("sequelize");
const _ = require("lodash");
const { response } = require("express");
const { QueryTypes } = require("sequelize");
const Challengeusers = require("../models/challengeusers");
const { json } = require("body-parser");
const { escapeRegExp, result, conforms, map } = require("lodash");
const users = require("../models/users");
const friends = require("../models/friends");
const Cards = require("../models/cards");
const Comments = require("../models/comments");
const Likes = require("../models/likes");

const sequelize = require("../database/db");
const cards = require("../models/cards");
const Products = require("../models/products");
const newOrder = require("../models/newOrder");
const orderItems = require("../models/orderItems");

const stripe = require("stripe")(
  "sk_test_51HTwftB4BEDe4p7rCZpSriogpWiBXa3HFwMW6hhxsfynupWEDYRETBGWXePjN5lQKiN8wXPCYgE1g0q62abYfyE400AVHOENnM"
);

// router.get('/', (req, res) => {
//   console.log("server is runing")
// })

router.post("/register", async (req, res) => {
  console.log(req.body);
  //Validate Data
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  //Check if user is already in database
  const emailExists = await User.findOne({ where: { email: req.body.email } });
  if (emailExists) return res.status(400).json("Email already Exists");

  //Check if username already in exists
  const userNameExists = await User.findOne({
    where: { username: req.body.username },
  });
  if (userNameExists) return res.status(400).json("Username already Taken");

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
        res.json("updated");
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
        res.json("new user location updated");
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
  console.log(req.body);
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  //check if the email exists in database
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) return res.status(400).json({ error: "Email does not Exists" });

  // check if password is corrrect
  // const validPassword = await bcrypt.compare(req.body.password, user.password);
  // if (!validPassword)
  //   return res.status(400).json({ error: "invalid password" });

  // // send user
  // res.json({ username: user })

  //created Jsonwebtoken

  const token = jwt.sign({ id: user.id }, process.env.SECRET_TOKEN);
  res.header("authToken", token).json({ token: token });

  console.log(token);
});

router.get("/users", verify, (req, res) => {
  // get all users
  User.findAll().then((users) => {
    res.status(200).json({
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
    res.json("Invalid Token");
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

router.get("/friends/:id", async (req, res) => {
  try {
    console.log("body", req.params);
    // const user_id = req.body.user_id;
    const user_id = req.params.id;

    // const user_id = 9

    if (!user_id) return res.status(400).json({ error: "user not logged in" });

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
      const friendPendingIds = _.without(mergedIds, JSON.parse(user_id));

      console.log(req.params.id);

      console.log("friends ids only", friendPendingIds);

      //finds the ids of the friends and returns to client
      User.findAll({
        attributes: [
          "id",
          "first_name",
          "last_name",
          "username",
          "display_pic",
        ],
        where: {
          id: friendPendingIds,
        },
      }).then((friendlist) => {
        console.log(friendlist);
        if (!friendlist || friendlist.length == 0) {
          console.log("NO FROENDS");
          res.status(400).json({ error: "No friends found " });
        } else {
          res.status(200).json({
            message: friendlist,
          });
        }
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/friends-pending/:id", async (req, res) => {
  try {
    // const user_id = req.body.user_id;
    const user_id = req.params.id;

    // const user_id = 21

    if (!user_id) return res.status(400).json("user not logged in");

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
      const friendPendingIds = _.without(mergedIds, JSON.parse(user_id));

      //finds the ids of the pending friends and returns to client
      User.findAll({
        attributes: [
          "id",
          "first_name",
          "last_name",
          "username",
          "display_pic",
        ],
        where: {
          id: friendPendingIds,
        },
      }).then((friendlist) => {
        if (!friendlist || friendlist.length == 0) {
          res.status(400).json("No pending friends ");
        } else {
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

    if (!user_id) return res.status(400).json("user not logged in");

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
        res.status(400).json("Request sent");
      });
    }
    // check if the users are already friends
    else if (requestExists[0].confirmed === 1) {
      res.status(400).json("Alerady friends");
    }
    // check if the user logged in is the one who made the request, if so, and they hit the same endpoint again then it will remove the request(delete the pending friend request)
    else if (requestExists[0].user_id1 === user_id) {
      Friends.destroy({
        where: {
          id: requestExists[0].id,
        },
      }).then((response) => {
        res.status(204).json("Request deleted");
      });
    }
    // if its not the logged in user then the request has already been made by another user so it will be in the users pending to accept or decline friends
    else {
      res.status(400).json("Request pending, check pending tab");
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

    if (!user_id) return res.status(400).json("user not logged in");

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
      return res.status(400).json(" No Friend Request Exists ");

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
        res.status(201).json("Friend accepted");
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

    if (!user_id) return res.status(400).json("user not logged in");

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
      return res.status(400).json(" No Friend Request Found ");

    // if friend request is found then it will delete the request made
    if (friendRequested) {
      Friends.destroy({
        where: {
          id: friendRequested.id,
        },
      }).then((response) => {
        console.log("here");
        res.json("Request deleted");
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

    if (!user_id) return res.status(400).json("user not logged in");

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
      return res.status(400).json(" friendship not found ");

    // if friends, then delete
    if (friendExists) {
      Friends.destroy({
        where: {
          id: friendExists[0].id,
        },
      }).then((response) => {
        // return res.status(204).json(" friend removed ");
        res.json("friend removed");
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

    if (!user_id) return res.status(400).json("user not logged in");

    async function createChallenge() {
      const challenge = new Challenges({
        user_id,
        type,
        date,
        content,
      });
      const savedChallenge = await challenge.save().then(function (result) {
        res.status(201).json("challenge made");
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

    const challengeExists = await Challengeusers.findAll({
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
          res.status(400).json("Already doing the same challenge on this day");
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

    if (!user_id) return res.status(400).json("user not logged in");

    const ChallengeSent = await Challengeusers.findOne({
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
          res.status(201).json("Invite sent");
        });
    }

    // check if the users are already doing challenge
    else if (ChallengeSent.dataValues.status === 1) {
      res.status(400).json("Already doing challenge");
    }
    // check if the user logged in is the one who sent the invite request, if so, and they hit the same endpoint again then it will remove the request(delete the pending invite request)
    else if (ChallengeSent.dataValues.sent_id === user_id) {
      Challengeusers.destroy({
        where: {
          id: ChallengeSent.id,
        },
      }).then((response) => {
        res.json("Invite deleted");
      });
    }
    // if its not the logged in user then the request has already been made by another user so it will be in the users pending to accept or decline friends
    else {
      res
        .status(400)
        .json("Request to join has aleady been sent to this person");
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/challenge-accept/:userId/:challengeId", async (req, res) => {
  try {
    // const user_id = req.body.id
    //const friend_id = req.body.friend_id
    // const user_id = req.body.user_id;
    const user_id = req.params.userId;
    const challenge_id = req.params.challengeId;

    if (!user_id) return res.status(400).json("user not logged in");

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
      return res.status(400).json(" No Challenge Requests Exists ");
    //  console.log(challengeRequest.dataValues.challenge_id)

    // if challenge request is found then it will update the confirmed field to 1 whitch is true
    if (challengeRequest) {
      Challengeusers.update(
        {
          status: 1,
        },
        {
          where: {
            id: challengeRequest.dataValues.id,
          },
        }
      ).then((response) => {
        res.status(201).json("Challenge accepted");
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/challenge-decline/:userId/:challengeId", async (req, res) => {
  try {
    // const user_id = req.body.id
    //const friend_id = req.body.friend_id
    const user_id = req.params.userId;
    const challenge_id = req.params.challengeId;

    if (!user_id) return res.status(400).json("user not logged in");

    // looks for the challenges pending where status is 0 and user_id
    const challengeRequest = await Challengeusers.findOne({
      where: {
        user_id,
        status: 0,
        challenge_id,
      },
    });

    // if no challenge request found then it returns the message
    if (!challengeRequest)
      return res.status(400).json(" No Challenge Requests Exists ");
    //  console.log(challengeRequest.dataValues.challenge_id)

    // if challenge request is found then it will update the confirmed field to 1 whitch is true
    if (challengeRequest) {
      Challengeusers.destroy({
        where: {
          id: challengeRequest.dataValues.id,
        },
      }).then((response) => {
        res.status(204).json("Challenge declined");
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/challenges/:id", async (req, res) => {
  // i think this is approved challenges
  try {
    const user_id = req.body.user_id;
    const id = req.params.id;

    // if (!user_id) return res.status(400).json("user not logged in");

    Challengeusers.belongsTo(Challenges, { foreignKey: "challenge_id" });
    Challengeusers.belongsTo(User, { foreignKey: "sent_id" });

    const challengeExists = await Challengeusers.findAll({
      where: {
        user_id: id,
        status: 1,
      },
      include: [
        {
          model: Challenges,
          attributes: [
            "id",
            "content",
            "date",
            "type",
            "createdAt",
            "UpdatedAt",
          ],
          required: true,
        },
        {
          model: User,
          attributes: ["id", "first_name", "username", "display_pic"],
          required: true,
        },
      ],
    }).then((challenges) => {
      if (!challenges || challenges.length == 0) {
        res.status(400).json("no challenge found");
      } else {
        res.status(200).json({
          challenges,
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/users-in-challenge", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const challenge_id = req.body.challenge_id;

    if (!user_id) return res.status(400).json("user not logged in");

    // Challengeusers.belongsTo(Challenges, { foreignKey: "challenge_id" });
    Challengeusers.belongsTo(User, { foreignKey: "sent_id" });
    Challengeusers.belongsTo(User, { foreignKey: "user_id" });

    const challengeExists = await Challengeusers.findAll({
      where: {
        challenge_id,
        status: 1,
      },
      attributes: ["id"],
      include: [
        {
          model: User,
          attributes: ["first_name", "username", "display_pic"],
          required: true,
        },
      ],
    }).then((usersInChallenge) => {
      if (!usersInChallenge || usersInChallenge.length == 0) {
        res.status(400).json("no users in challenge");
      } else {
        res.status(200).json({
          message: usersInChallenge,
        });
      }
    });

    // var usersInChallenge = usersInChallenge.map((result) => {
    //   return result.dataValues.user_id;
    // });

    // User.findAll({
    //   where: {
    //     id: usersInChallenge,
    //   },
    // }).then((users) => {
    //   if (!users || users.length == 0) {
    //     res.status(400).json("challenge dont exist");
    //   } else {
    //     res.status(200).json({
    //       message: users,
    //     });
    //   }
    // });
    // });
  } catch (error) {
    console.log(error);
  }
});

router.get("/challenges-pending/:id", async (req, res) => {
  try {
    const user_id = req.params.id;

    // const user_id = 21

    // if (!user_id) return res.status(400).json("user not logged in");

    Challengeusers.belongsTo(Challenges, { foreignKey: "challenge_id" });
    Challengeusers.belongsTo(User, { foreignKey: "sent_id" });

    // find all pending friends where the user id is either user_id1 or user_id2 & confirmed is set true
    Challengeusers.findAll({
      where: {
        user_id,
        status: 0,
      },
      include: [
        {
          model: Challenges,
          attributes: [
            "id",
            "content",
            "date",
            "type",
            "createdAt",
            "UpdatedAt",
          ],
          required: true,
        },
        {
          model: User,
          attributes: ["first_name", "username", "display_pic"],
          required: true,
        },
      ],
    }).then((challengesPending) => {
      if (!challengesPending || challengesPending.length == 0) {
        res.status(400).json("No Pending Challenges");
      } else {
        res.status(201).json(challengesPending);
      }
    });

    // // find all pending friends where the user id is either user_id1 or user_id2 & confirmed is set true
    // Challengeusers.findAll({
    //   where: {
    //     user_id,
    //     status: 0,
    //   },
    // }).then((challengesPending) => {

    //   // returns all ids
    //   var promise = challengesPending.map((challenge) => {
    //     return challenge.dataValues.id;
    //   });

    //   // // merges the ids into one arrray
    //   var challengeIds = [].concat.apply([], promise);

    //   console.log(challengeIds);

    //   //finds the ids of the pending challenes and return to client
    //   Challenges.findAll({
    //     where: {
    //       id: challengeIds,
    //     },
    //   }).then((challengeList) => {
    //     if (!challengeList || challengeList.length == 0) {
    //       res.status(400).json("No pending challenges found");
    //     } else {
    //       res.status(200).json({
    //         pendingChallenges: challengeList,
    //       });
    //     }
    //   });
    // });
  } catch (error) {
    console.log(error);
  }
});

// router.get("/user-profile/:id", async (req, res) => {

//   try {
//     const user_id = req.body.user_id;
//     // const user_id = 21

//     if (!user_id) return res.status(400).json("user not logged in");

//     const id = req.params.id;

//     users
//       .findOne({
//         where: {
//           id,
//         },
//       })
//       .then((user) => {
//         Friends.findAll({
//           where: {
//             [Op.or]: [{ user_id1: user.id }, { user_id2: user.id }],
//             [Op.and]: [{ confirmed: 1 }],
//           },
//         }).then((friendslist) => {
//           // returns all ids
//           var promise = friendslist.map((friend) => {
//             var user_id1 = friend.dataValues.user_id1;
//             var user_id2 = friend.dataValues.user_id2;
//             return [user_id1, user_id2];
//           });

//           // merges the ids into one arrray
//           var mergedIds = [].concat.apply([], promise);

//           // removes the userid from the list
//           const friendPendingIds = _.without(mergedIds, user.id);
//           console.log("friends ids only", friendPendingIds);

//           User.findAll({
//             where: {
//               id: friendPendingIds,
//             },
//           }).then(function (friendsList) {
//             Challengeusers.findAll({
//               where: {
//                 user_id: user.id,
//                 status: 1,
//               },
//             }).then((challenges) => {
//               var promise = challenges.map((result) => {
//                 // console.log(result.challenge_id)
//                 return result.challenge_id;
//               });

//               Challenges.findAll({
//                 where: {
//                   id: promise,
//                 },
//               }).then((challenges) => {
//                 user = JSON.parse(JSON.stringify(user));

//                 user.friendsList = friendsList;
//                 user.challenges = challenges;

//                 return res.status(200).json({
//                   user: user,
//                 });
//               });
//             });
//           });
//         });
//       });
//   } catch (error) {
//     console.log(error);
//   }

// });

router.get("/user-profile/:username", async (req, res) => {
  try {
    username = req.params.username;

    // if (!user_id) return res.status(400).json({ error: "user not logged in" });

    User.findOne({
      attributes: [
        "id",
        "first_name",
        "username",
        "display_pic",
        "bio",
        "trophy_level",
        "emaan_level",
      ],
      where: {
        username: username,
      },
    }).then((response) => {
      res.status(200).json({
        message: response,
      });
    });
  } catch (error) {
    console.log("error");
  }
});

// router.get("/friends/:id", async (req, res) => {

//   try {
//     console.log("body", req.params);
//     const user_id = req.params.id;
//     const id = req.params.id;
//     // const user_id = 9

//     console.log("HELLO");

//     if (!user_id) return res.status(400).json({ error: "user not logged in" });

//     // find all friends where the user id is either user_id1 or user_id2 & confirmed is set true
//     console.log("FIND FIRENDs");
//     Friends.findAll({
//       where: {
//         [Op.or]: [{ user_id1: id }, { user_id2: id }],
//         [Op.and]: [{ confirmed: 1 }],
//       },
//     }).then((friendslist) => {
//       // returns all ids
//       var promise = friendslist.map((friend) => {
//         var user_id1 = friend.dataValues.user_id1;
//         var user_id2 = friend.dataValues.user_id2;
//         return [user_id1, user_id2];
//       });

//       // merges the ids into one arrray
//       var mergedIds = [].concat.apply([], promise);

//       console.log("merged ids", mergedIds);

//       // removes the userid from the list
//       const friendPendingIds = _.without(mergedIds, id);
//       console.log("friends ids only", friendPendingIds);

//       //finds the ids of the friends and returns to client
//       User.findAll({
//         where: {
//           id: friendPendingIds,
//         },
//       }).then((friendlist) => {
//         console.log("hello")
//         if (!friendlist || friendlist.length == 0) {
//           console.log("NO FROENDS");
//           res.status(400).json({ error: "No friends found " });
//         } else {
//           res.status(200).json({
//             message: friendlist,
//           });
//         }
//       });
//     });
//   } catch (error) {
//     console.log(error);
//   }

// });

router.post("/card", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    // const user_id = 21

    if (!user_id) return res.status(400).json("user not logged in");

    async function createCard() {
      const card = new Cards({
        user_id: req.body.user_id,
        content: req.body.content,
      });
      const savedCard = await card.save().then(function (result) {
        res.status(201).json("card made");
        return result;
      });
    }

    createCard();
  } catch (error) {
    console.log(error);
  }
});

router.get("/cards", async (req, res) => {
  try {
    const user_id = req.body.user_id;

    // if (!user_id) return res.status(400).json("user not logged in");

    Cards.belongsTo(User, { foreignKey: "user_id" });
    // Cards.hasMany(Comments,  {foreignKey: 'card_id'})

    Cards.findAll({
      // order: sequelize.random(), limit: 1,
      include: [
        {
          model: User,
          attributes: ["first_name", "username", "display_pic"],
          required: true,
        },
        //   {
        //   model: Comments,
        //   required: true,
        //  },
      ],
    }).then((cards) => {
      cards = cards.reverse();
      res.status(200).json({
        message: cards,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/cards/:userId", async (req, res) => {
  try {
    // const user_id = req.body.user_id;
    const user_id = req.params.userId;

    // if (!user_id) return res.status(400).json("user not logged in");

    Cards.belongsTo(User, { foreignKey: "user_id" });
    // Cards.hasMany(Comments,  {foreignKey: 'card_id'})

    Cards.findAll({
      where: {
        user_id,
      },
    }).then((cards) => {
      cards = cards.reverse();
      res.status(200).json({
        cards,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/cards/comment/:id", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    card_id = req.params.id;
    // const user_id = 21

    // if (!user_id) return res.status(400).json("user not logged in");

    // User.hasMany(Cards,  {foreignKey: 'user_id'})
    Comments.belongsTo(User, { foreignKey: "user_id" });

    Comments.findAll({
      where: { card_id },
      attributes: ["id", "content", "createdAt", "updatedAt"],
      include: [
        {
          model: User,
          attributes: ["first_name", "username", "display_pic"],
          required: true,
        },
      ],
    }).then((comments) => {
      comments = comments.reverse();
      var length = comments.length;

      res.json({
        comments: comments,
        length,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/comment/:card_id", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const card_id = req.params.card_id;
    const content = req.body.content;

    // const post_id = req.params.id
    // const user_id = 21

    // if (!user_id) return res.status(400).json("user not logged in");
    // if (!card_id) return res.status(400).json("Card no longer avilable");

    const comment = new Comments({
      user_id,
      content,
      card_id,
    });
    const savedComment = await comment.save().then(function (result) {
      // res.status(201).json('comment made')
      return result;
    });

    await Comments.findAll({
      where: {
        card_id: savedComment.dataValues.card_id,
      },
    }).then((comments) => {
      var commentsAmount = comments.length;
      var card_id = savedComment.dataValues.card_id;

      Cards.update(
        {
          comments: commentsAmount,
        },
        {
          where: {
            id: card_id,
          },
        }
      ).then((response) => {
        res.status(201).json({
          message: "Comment Made",
        });
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/like/:card_id", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const card_id = req.params.card_id;

    if (!user_id) return res.status(400).json("user not logged in");
    if (!card_id) return res.status(400).json("Card no longer avilable");

    async function createLike() {
      const like = new Likes({
        user_id,
        card_id,
      });
      const savedLike = await like.save().then(function (result) {
        Likes.findAll({
          where: {
            card_id,
          },
        }).then((likes) => {
          var likesAmount = likes.length;

          Cards.update(
            {
              likes: likesAmount,
            },
            {
              where: {
                id: card_id,
              },
            }
          ).then((response) => {
            res.status(201).json({
              message: "Like Made",
            });
          });
        });
      });
    }

    await Likes.findOne({
      where: {
        card_id,
        user_id,
      },
    }).then((likes) => {
      if (!likes || likes.length === 0) {
        createLike();
      } else if (likes.id) {
        Likes.destroy({
          where: {
            id: likes.id,
          },
        });

        Likes.findAll({
          where: {
            card_id,
          },
        }).then((likes) => {
          var likesAmount = likes.length;

          Cards.update(
            {
              likes: likesAmount,
            },
            {
              where: {
                id: card_id,
              },
            }
          ).then((response) => {
            res.status(201).json({
              message: "Unliked",
            });
          });
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/books", async (req, res) => {
  try {
    // const user_id = req.body.user_id;
    const user_id = req.params.userId;

    // // if (!user_id) return res.status(400).json("user not logged in");

    // Cards.belongsTo(User, { foreignKey: "user_id" });
    // // Cards.hasMany(Comments,  {foreignKey: 'card_id'})

    Products.findAll({
      where: {
        categorie: 1,
      },
    }).then((books) => {
      books = books.reverse();
      res.status(200).json({
        books,
      });
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/payments/create", async (req, res) => {
  try {
    const total = req.query.total;
    console.log("payment request received", total);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: "gbp",
    });

    res.status(201).send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log("error from server", error);
  }
});

router.post("/order", async (req, res) => {
  try {
    async function createNewOrder() {
      const order = new newOrder({
        user_id: req.body.user_id,
        order_id: req.body.order_id,
        ammount: req.body.ammount,
      });
      const savedNewOrder = await order.save().then(function (result) {
        // return result;
      });
    }
    async function createNewOrderItem() {
      basket = req.body.basket;

      basket.map((basketItem) => {
        console.log(basketItem.id);

        const savedOrderItems = new orderItems({
          order_id: req.body.order_id,
          product_id: basketItem.id,
          image: basketItem.image,
          price: basketItem.price,
          rating: basketItem.rating,
          categorie: basketItem.categorie,
        });

        const savedNewOrder = savedOrderItems.save().then(function (result) {
          // return result;
        });
      });
    }

    createNewOrder();
    createNewOrderItem();
  } catch (error) {
    console.log("error from server", error);
  }
});

router.get("/orders2", async (req, res) => {
  try {
    const user_id = 1;

    newOrder.belongsTo(orderItems, { foreignKey: "order_id" });

    newOrder
      .findAll({
        where: {
          order_id: 77,
        },
        include: [
          {
            model: orderItems,
            // attributes: ["id"],
            required: false,
          },
          //   {
          //   model: Comments,
          //   required: true,
          //  },
        ],
      })
      .then((orders) => {
        res.status(201).json({
          message: orders,
        });
        //   let newOrders = orders;

        //   var orderIds = orders.map((order) => {
        //     // console.log(result.challenge_id)
        //     return order.order_id;
        //   });

        //   orderItems
        //     .findAll({
        //       where: {
        //         order_id: orderIds,
        //       },
        //     })
        //     .then((result) => {
        //       orders = JSON.parse(JSON.stringify(orders));

        //       res.status(201).json({
        //         message: orders,
        //       });
        //     });
      });
  } catch (error) {
    console.log(error);
  }
});

router.get("/orders/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    orderItems.belongsTo(Products, { foreignKey: "product_id" });

    newOrder
      .findAll({
        where: {
          user_id,
        },
      })
      .then((orders) => {
        var orderIds = orders.map((order) => {
          // console.log(result.challenge_id)
          return order.order_id;
        });
        orderItems
          .findAll({
            where: {
              order_id: orderIds,
            },
            include: [
              {
                model: Products,
                required: false,
              },
            ],
          })
          .then((result) => {
            res.status(201).json({
              orders: result,
            });
          });
      });
  } catch (error) {
    console.log(error);
  }
});

router.get("/seperateOrders/:id", async (req, res) => {
  try {
    const user_id = 1;
    const order_id = req.params.id;

    orderItems
      .findAll({
        where: {
          order_id,
        },
      })
      .then((result) => {
        res.status(201).json({
          orders: result,
        });
      });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
