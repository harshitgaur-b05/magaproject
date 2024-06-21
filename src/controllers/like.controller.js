import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.json(new ApiResponse({ message: 'Video unliked' }));
    } else {
        const like = new Like({ video: videoId, likedBy: userId });
        await like.save();
        return res.json(new ApiResponse({ message: 'Video liked' }));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'Invalid comment ID');
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.json(new ApiResponse({ message: 'Comment unliked' }));
    } else {
        const like = new Like({ comment: commentId, likedBy: userId });
        await like.save();
        return res.json(new ApiResponse({ message: 'Comment liked' }));
    }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        return res.json(new ApiResponse({ message: 'Tweet unliked' }));
    } else {
        const like = new Like({ tweet: tweetId, likedBy: userId });
        await like.save();
        return res.json(new ApiResponse({ message: 'Tweet liked' }));
    }
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
                                  .populate('video');

    res.json(new ApiResponse(likedVideos.map(like => like.video)));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};
