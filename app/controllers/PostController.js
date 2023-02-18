const { notify, notifyAll } = require("../utility/notification");
const service = require("../services/PostService");
const userRepository = require("../repository/UserRepository");
const fcmRepository = require("../repository/FcmRepository");
const subscribersRepository = require("../repository/SubscribersRepository");
const adminRepository = require("../repository/AdminRepository");
const channelRepository = require("../repository/ChannelRepository");
const clubRepository = require("../repository/ClubRepository");
const postRepository = require("../repository/PostRepository");
const urlRepository = require("../repository/UrlRepository");
const validate = require("../utility/validate");

const getPosts = async (req, res) => {
    try {
        const posts = await service.getPosts(req.query.channelId);
        res.status(200).send(posts);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
};

const savePost = async (req, res) => {
    try {
        const post = req.body;
        const postId = post.pid;
        await service.savePost(post);

        // Send response to user
        res.status(200).send({});

        await notifyUsers(postId, 0);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
};

const deletePost = async (req, res) => {
    try {
        await service.deletePost(req.params.postId);

        res.status(200).send({});

        await sendDeletePushNotification(
            req.params.postId,
            req.query.channelId
        );
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
};

// Notify user of post deletion
const sendDeletePushNotification = async (postId, channelId) => {
    await notifyAll({
        deleted: "1",
        pid: postId.toString(),
        chid: channelId.toString(),
    });
};

const updatePost = async (req, res) => {
    try {
        await service.updatePost(req.params.postId, req.body.message);

        // Send response to user
        res.status(200).send({});

        await notifyUsers(req.params.postId, 1);
    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error.message });
    }
};

// Notify users about new post / post update
const notifyUsers = async (postId, updated) => {
    // Get inserted post details
    const post = await postRepository.getPostByPostId(postId);

    // Get admin details
    const user = await userRepository.getUserByUid(post.uid);

    // Get channel details
    const channel = await channelRepository.getChannelByChannelId(post.chid);

    // Get club details
    const club = await clubRepository.getClubByClubId(channel.cid);

    // Notify subscribers for new post
    if (post.general) {
        await notifyAll({
            ...post,
            time: post.time.toString(),
            uid: post.uid.toString(),
            pid: post.pid.toString(),
            cid: channel.cid.toString(),
            chid: post.chid.toString(),
            general: post.general.toString(),
            adminName: user.name,
            adminAvatar: user.avatar,
            clubName: club.name,
            channelName: channel.name,
            updated: updated.toString(),
        });
    } else {
        await notify(club.cid, {
            ...post,
            time: post.time.toString(),
            uid: post.uid.toString(),
            pid: post.pid.toString(),
            cid: channel.cid.toString(),
            chid: post.chid.toString(),
            general: post.general.toString(),
            adminName: user.name,
            adminAvatar: user.avatar,
            clubName: club.name,
            channelName: channel.name,
            updated: updated.toString(),
        });
    }
};

module.exports = {
    getPosts,
    savePost,
    deletePost,
    updatePost,
};
