import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const playlist = new Playlist({
        name,
        description,
        owner: req.user._id  // Assuming req.user._id contains the ID of the logged-in user
    });

    const savedPlaylist = await playlist.save();

    res.json(new ApiResponse(savedPlaylist));
});


const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const playlists = await Playlist.find({ owner: userId }).exec();

    res.json(new ApiResponse(playlists));
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId).exec();

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    res.json(new ApiResponse(playlist));
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $push: { videos: videoId } },
        { new: true }
    ).exec();

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    res.json(new ApiResponse(playlist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    ).exec();

    if (!playlist) {
        throw new ApiError(404, 'Playlist not found');
    }

    res.json(new ApiResponse(playlist));
});


const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId).exec();

    if (!deletedPlaylist) {
        throw new ApiError(404, 'Playlist not found');
    }

    res.json(new ApiResponse(deletedPlaylist));
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { name, description },
        { new: true }
    ).exec();

    if (!updatedPlaylist) {
        throw new ApiError(404, 'Playlist not found');
    }

    res.json(new ApiResponse(updatedPlaylist));
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}