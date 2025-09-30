import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination

  // Step 1: Build the search/filter conditions
  // If there's a search query, search in title and description
  // If userId is provided, filter by specific user
  // Only show published videos

  // Step 2: Build sort conditions
  // Default sort by creation date (newest first)

  // Step 3: Calculate pagination

  // Step 4: Execute the query

  // Step 5: Get total count for pagination info

  // Step 6: Return response

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  const matchConditions = {};

  if (query) {
    matchConditions.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ]; // Note: $options : "i" is used as case sensitive it stands for ignore case without it searches are case sensitive by default it makes regex case sensitive means JavaScript and javascript both will appears in the search panel when a user type "j" or "J"
  } // in query the user is typing JS for studying

  if (userId) {
    matchConditions.owner = userId;
  }

  matchConditions.isPublic = true;

  const sortConditions = {};
  if (sortBy && sortType) {
    sortConditions[sortBy] = sortType === "desc" ? -1 : 1;
    // If user wants to sort by views (highest first)
    // sortBy = "views", sortType = "desc"
    // sortConditions becomes:  {views : -1}
  } else {
    sortConditions.createdAt = -1; // -1 means from Z to A
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const videos = await Video.find(matchConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("owner", "fullName username avatar");

  const totalVideos = await Video.countDocuments(matchConditions);

  const currentPage = parseInt(page);
  const totalPages = Math.ceil(totalVideos / parseInt(limit));
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return res.status(200).json(
    new APIresponse(
      200,
      {
        videos,
        totalVideos,
        currentPage,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      "Videos fetched Successfully!"
    )
  );

  {
    /* "statusCode": 200,
          "data": {
            "videos": [
              {
                "_id": "...",
                "title": "JavaScript Basics",
                "description": "Learn JavaScript fundamentals",
                "views": 1500,
                "owner": {
                  "username": "johndoe",
                  "fullName": "John Doe",
                  "avatar": "https://..."
                }
              }
              // ... more videos
            ],
            "currentPage": 2,
            "totalPages": 5,
            "totalVideos": 47,
            "hasNextPage": true,
            "hasPrevPage": true
          },
          "message": "Videos fetched successfully" */
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
