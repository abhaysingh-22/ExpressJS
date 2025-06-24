import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user._id;

  if (!userId) {
    throw new APIError("User not found", 400);
  }

  const videos = await Video.find({ owner: userId }, { _id: 1 }/*this will helps us to extract only id's in the form of array*/); // for eg:- [{ _id: ObjectId("...") }, { _id: ObjectId("...") }]
  const videoIds = videos.map((video) => video._id); // this will helps us to create an another array of containing only id's for eg [ObjectId("..."), ObjectId("...")]

  const totalVideos = await Video.countDocuments({ owner: userId });
  const totalSubscribers = await Subscription.countDocuments({
    channel: userId,
  });
  const totalVideoViews = await Video.aggregate([
    { $match: { owner: userId } }, // aggregate pipelines
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  const totalViews = totalVideoViews[0]?.totalViews || 0;
  const totalLikes = await Like.countDocuments({ video: { $in: videoIds } }); // using $in we can match the multiple video IDs

  return res
    .status(200)
    .json(
      new APIresponse(
        200,
        { totalVideos, totalSubscribers, totalViews, totalLikes },
        "Dashboard data fetched Successfully!"
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user._id;

  if(!userId){
    throw new APIError("User not found", 400)
  }

  const getVideos = await Video.find({owner : user})

  if(getVideos.length === 0){      // here we are doing this because getVideos will fetched the videos id in the ofrm of array soo we need to give the condition like this if length of the array is zero then provide the erro message 
    throw new APIError("Unable to fetch videos", 400)
  }

  return res
    .status(200)
    .json(
      new APIresponse(
        200,
        { getVideos },
        "Videos fetched Successfully!"
      )
    );
});

export { getChannelStats, getChannelVideos };