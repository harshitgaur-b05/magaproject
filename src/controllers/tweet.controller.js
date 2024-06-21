import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
const createTweet = asyncHandler(async (req, res) => {
    const { text } = req.body;
    const { userId } = req.user; // Assuming userId is available in req.user after authentication

    // Check if the userId is a valid ObjectId
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid userId');
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Create the tweet
    const newTweet = new Tweet({
        text,
        user: userId
    });

    const savedTweet = await newTweet.save();

    res.json(new ApiResponse(savedTweet));
});


const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Check if the userId is a valid ObjectId
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid userId');
    }

    // Find tweets where user matches userId
    const tweets = await Tweet.find({ user: userId })
        .populate('user', 'username') // Populate user details (only username)
        .exec();

    res.json(new ApiResponse(tweets));
});


const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { text } = req.body;
    const { userId } = req.user; // Assuming userId is available in req.user after authentication

    // Check if the tweetId and userId are valid ObjectIds
    if (!mongoose.isValidObjectId(tweetId) || !mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid tweetId or userId');
    }

    // Check if the tweet exists and if the user is the author of the tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    if (tweet.user.toString() !== userId) {
        throw new ApiError(403, 'Unauthorized');
    }

    // Update the tweet
    tweet.text = text;
    const updatedTweet = await tweet.save();

    res.json(new ApiResponse(updatedTweet));
});


const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { userId } = req.user; // Assuming userId is available in req.user after authentication

    // Check if the tweetId and userId are valid ObjectIds
    if (!mongoose.isValidObjectId(tweetId) || !mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid tweetId or userId');
    }

    // Check if the tweet exists and if the user is the author of the tweet
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, 'Tweet not found');
    }

    if (tweet.user.toString() !== userId) {
        throw new ApiError(403, 'Unauthorized');
    }

    // Delete the tweet
    await tweet.remove();

    res.json(new ApiResponse({ message: 'Tweet deleted successfully' }));
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}