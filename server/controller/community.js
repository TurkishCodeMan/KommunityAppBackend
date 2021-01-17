const User = require("../models/User")
const Community = require("../models/Community");
const Activity = require("../models/Activity");
const Event = require("../models/Event");
const publish = require("../config/publisher");




const getAllUser = async (req, res, next) => {
    try {
        const Users = await User.find();
        return res.json(Users);
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })
    }
}

const getAllCommunity = async (req, res, next) => {
    try {
        const communities = await Community.find().populate("members");

        return res.json(communities);
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })
    }
}

const getAllActivity = async (req, res, next) => {
    try {
        const activity = await Activity.find().populate("participants");

        return res.json(activity);
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })
    }
}

const getCommunityById = async (req, res, next) => {
    try {
        let communityID = req.params.id;
        const community = await Community.findOne({ _id: communityID }).populate("activities"); //JOİN
        return res.json(community);
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })

    }
}

const getUserById = async (req, res, next) => {
    try {
        let userID = req.params.id;
        const user = await User.findOne({ _id: userID });
        return res.json(user);
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })

    }
}

const createCommunity = async (req, res, next) => {

    try {
        let community = new Community({
            name: req.body.name,
            location: req.body.location,
            description: req.body.description
        })
        await community.save();
        community.organizators.push(req.user._id)
        await community.save();

        publish("events", req.user, "createCommunity", community)
        console.log("Burada")

        return res.json(community)
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })

    }
}


const createActivity = async (req, res, next) => {
    try {
        console.log(req.params.id)
        let activity = new Activity({
            name: req.body.name,
            location: req.body.location,
            description: req.body.description,
            organizer: "5ff5c07bb9236c05cc6e29c0"

        })
        await activity.save();

        //Activity oluşturan communitye kaydet
        const community = await Community.findOne({ _id: req.params.id });
        community.activities.push(activity._id);
        await community.save();

        return res.json(activity)
    } catch (error) {
        return res.json({ message: "Server Error " + error.message })

    }
}

const subscribeCommunity = async (req, res, next) => {
    try {

        const community = await Community.findOne({ _id: req.params.id });
        community.members.push(req.user._id);
        await community.save();
        const user = await User.findOne({ _id: req.user._id });
        user.members.push(community._id);
        await user.save();

        publish("events", req.user, "subscribeCommunity", community)
        return res.json(community);
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })
    }
}

const unSubscribeCommunity = async (req, res, next) => {
    try {
        const community = await Community.findOne({ _id: req.params.id });

        community.members.pop(req.user._id)

        await community.save();
        const user = await User.findOne({ _id: req.user._id });
        user.members.pop(req.user._id)
        await user.save();
        publish("events", req.user, "unSubscribeCommunity", community)
        return res.json(community);
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })

    }
}

const subscribeActivity = async (req, res, next) => {
    try {
        const activity = await Activity.findOne({ _id: req.params.id });
        activity.participants.push(req.user._id);
        await activity.save();
        return res.json(activity)
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })
    }
}
const getRandomUser = async (req, res, next) => {
    try {
        var random = Math.floor(Math.random() * 10)
        random = 0;
        const users = await User.find().skip(random).exec();

        //FollowControl

        let _users = [];
        users.map(user => {
         
            if (req.user && req.user.following.length > 0) {
                req.user.following.forEach(id => {
                    if (id.toString() === user._id.toString()) {
                        _users.push({
                            _id:user._id,
                            name: user.name,
                            imageUrl: user.imageUrl,
                            googleID: user.googleID,
                            tag: user.tag,
                            follow: true,
                        })
                    }
                })
            } else {
             
                    _users.push({
                        _id:user._id,
                        name: user.name,
                        imageUrl: user.imageUrl,
                        googleID: user.googleID,
                        tag: user.tag,
                        follow: false,
                    })
                
               
            }

        })

        return res.json(_users)
    } catch (error) {
        return res.json({ message: "Server Errorr" + error.message })
    }
}


//Kullanılması için her olaya bir event ekleyip denetlenebilir
const getUserEvents = async (req, res, next) => {
    try {




        let followEvents = [];
        //Takipçilerinin eventleri
        req.user.following.forEach(async userID => {
            followEvents = await Event.find({ userID: userID }).populate({ path: 'userID' }).exec();

        });
        //Kendi Eventleri
        let myEvents = await Event.find({ userID: req.user._id }).populate({ path: 'userID' }).exec();;



        let allEvents = followEvents.concat(myEvents);

        return res.json(allEvents);



    } catch (error) {
        return res.json({ message: "Server Error" + error.message })
    }
}

const getMyCommunities = async (req, res, next) => {
    try {

        let communities = await Community.find({ "members": { $in: [req.user._id] } })

        return res.json(communities)
    } catch (error) {
        return res.json({ message: "Server Error" + error.message })
    }
}

const getFollowingUser = async (req, res, next) => {
    try {
        const followingUserID = req.params.id;
       
        let response = await req.user.followingUser(followingUserID)
        let user = await User.findOne({ _id: followingUserID });

        //Takip Etti Eventini DB ye atıyoruz
        publish("events", req.user, "followingUser", user);
        return res.json(response)
    } catch (error) {
        return res.json({ message: "Server Errorr" + error.message })

    }
}



module.exports = {
    getAllUser,
    getAllCommunity,
    getAllActivity,
    getCommunityById,
    getUserById,
    createCommunity,
    createActivity,
    subscribeCommunity,
    subscribeActivity,
    getRandomUser,
    getUserEvents,
    getMyCommunities,
    unSubscribeCommunity,
    getFollowingUser

}