import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate video ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const comments = await Comment.find({ video: videoId })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

    const totalComments = await Comment.countDocuments({ video: videoId });

    res.json(new ApiResponse({
        comments,
        totalPages: Math.ceil(totalComments / limit),
        currentPage: parseInt(page),
    }));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { text, user } = req.body;

    // Validate video ID
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const comment = new Comment({
        video: videoId,
        text,
        user,
    });

    await comment.save();

    res.status(201).json(new ApiResponse(comment));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;

    // Validate comment ID
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, 'Invalid comment ID');
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        { text },
        { new: true, runValidators: true }
    );

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    res.json(new ApiResponse(comment));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Validate comment ID
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, 'Invalid comment ID');
    }

    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    res.json(new ApiResponse({ message: 'Comment deleted successfully' }));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
