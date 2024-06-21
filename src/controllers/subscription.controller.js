import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const { userId } = req.user; // Assuming userId is available in req.user after authentication

    // Check if the channelId is a valid ObjectId
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, 'Invalid channelId');
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Check if the channel exists
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, 'Channel not found');
    }

    // Check if there's already a subscription
    let subscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    });

    if (subscription) {
        // Subscription already exists, so delete it
        await subscription.remove();
        res.json(new ApiResponse({ subscribed: false }));
    } else {
        // Subscription does not exist, so create it
        subscription = new Subscription({
            subscriber: userId,
            channel: channelId
        });
        await subscription.save();
        res.json(new ApiResponse({ subscribed: true }));
    }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Check if the channelId is a valid ObjectId
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, 'Invalid channelId');
    }

    // Find all subscriptions where channel matches channelId
    const subscriptions = await Subscription.find({ channel: channelId })
        .populate('subscriber', 'username') // Populate subscriber details (only username)
        .exec();

    const subscribers = subscriptions.map(subscription => subscription.subscriber);

    res.json(new ApiResponse(subscribers));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Check if the subscriberId is a valid ObjectId
    if (!mongoose.isValidObjectId(subscriberId)) {
        throw new ApiError(400, 'Invalid subscriberId');
    }

    // Find all subscriptions where subscriber matches subscriberId
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate('channel', 'username') // Populate channel details (only username)
        .exec();

    const subscribedChannels = subscriptions.map(subscription => subscription.channel);

    res.json(new ApiResponse(subscribedChannels));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}