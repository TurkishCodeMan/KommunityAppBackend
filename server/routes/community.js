const express = require('express');

const router = express.Router();
const communityController = require('../controller/community');
const isAuthenticated = require("../middlewares/isAuthenticated")


//Yardımcı Rotalar
router.get("/random-user", communityController.getRandomUser)

router.get("/last-events", communityController.getUserEvents);


// All-User
router.get('/all-users', communityController.getAllUser);

//All-Activity
router.get("/all-activity", communityController.getAllActivity)

// All Community
router.get('/', communityController.getAllCommunity);

//My Communities
router.get("/my-communities", communityController.getMyCommunities)

// Get One Community
router.get('/community/:id', communityController.getCommunityById);

// Get One User
router.get('/user/:id', communityController.getUserById);

// Create A Community
router.post('/create-community', communityController.createCommunity);

// Subscribe A Community
router.get('/subscribe-community/:id', communityController.subscribeCommunity);

//UnSubscribeCommunity
router.get("/unsubscribe-community/:id", communityController.unSubscribeCommunity);

// Subscribe A Activity
router.get('/subscribe-activity/:id', communityController.subscribeActivity);

// Create A Activity
router.post('/create-activity/:id', communityController.createActivity);

//Following A User
router.get("/following-user/:id",communityController.getFollowingUser);



module.exports = router;
