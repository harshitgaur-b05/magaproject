import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Convert page and limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // Build query object based on query parameters
    const queryObj = {};
    if (query) {
        queryObj.$or = [
            { title: { $regex: query, $options: "i" } }, // Case-insensitive search for title
            { description: { $regex: query, $options: "i" } } // Case-insensitive search for description
        ];
    }
    if (userId && mongoose.isValidObjectId(userId)) {
        queryObj.owner = userId;
    }

    // Sort options
    const sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
    } else {
        // Default sort by createdAt descending
        sortOptions.createdAt = -1;
    }

    // Pagination options
    const options = {
        page,
        limit,
        sort: sortOptions,
        collation: { locale: "en" } // Case-insensitive sorting
    };

    // Perform pagination using mongoose paginate
    const videos = await Video.paginate(queryObj, options);

    res.json(new ApiResponse(videos));
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const { videoFile, thumbnail } = req.files; // Assuming files are uploaded using multer or similar

    // Upload video file and thumbnail to Cloudinary
    const videoFileUrl = await uploadOnCloudinary(videoFile);
    const thumbnailUrl = await uploadOnCloudinary(thumbnail);

    // Create the video record
    const newVideo = new Video({
        videoFile: videoFileUrl,
        thumbnail: thumbnailUrl,
        title,
        description,
        duration: 0, // Set initial duration if needed
        owner: req.user.userId // Assuming userId is available in req.user after authentication
    });

    const savedVideo = await newVideo.save();

    res.json(new ApiResponse(savedVideo));
});


const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if the videoId is a valid ObjectId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid videoId');
    }

    // Find the video by ID
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    res.json(new ApiResponse(video));
});


const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;

    // Check if the videoId is a valid ObjectId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid videoId');
    }

    // Find the video by ID
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Update video details
    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail || video.thumbnail;

    const updatedVideo = await video.save();

    res.json(new ApiResponse(updatedVideo));
});


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if the videoId is a valid ObjectId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid videoId');
    }

    // Find the video by ID and delete it
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    await video.remove();

    res.json(new ApiResponse({ message: 'Video deleted successfully' }));
});


const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Check if the videoId is a valid ObjectId
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid videoId');
    }

    // Find the video by ID
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Toggle publish status
    video.isPublished = !video.isPublished;

    const updatedVideo = await video.save();

    res.json(new ApiResponse(updatedVideo));
});


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}