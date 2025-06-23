import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  //TODO: toggle like on video
  const { videoId } = req.params;

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not exist", 400);
  }

  if (!videoId) {
    throw new APIError("video not exist", 400);
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: user._id,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(new APIresponse(200, {}, "Video Unliked"));
  } else {
    await Like.create({
      video: videoId,
      likedBy: user._id,
    });
    return res.status(200).json(new APIresponse(200, {}, "Video liked"));
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not exist", 400);
  }

  if (!commentId) {
    throw new APIError("Comment not exist", 400);
  }

  const existingCommentLike = await Like.findOne({
    comment: commentId,
    likedBy: user._id,
  });

  if (existingCommentLike) {
    await Like.deleteOne();
    return res.status(200).json(new APIresponse(200, {}, "Comment Unliked"));
  } else {
    await existingCommentLike.create({
      comment: commentId,
      likedBy: user._id,
    });
    return res.status(200).json(new APIresponse(200, {}, "Comment liked"));
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  if (!tweetId) {
    throw new APIError("tweet id not found", 400);
  }

  const existingTweetlike = await Like.findOne({
    tweet: tweetId,
    likedBy: user._id,
  });

  if (existingTweetlike) {
    await existingTweetlike.deleteOne();
    return res.status(200).json(new APIresponse(200, {}, "Tweet Unliked"));
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: user._id,
    });
    return res.status(200).json(new APIresponse(200, {}, "Tweet liked"));
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  const likeVideos = await Like.find({
    likedBy : user._id,
    video : {$ne : null}   //Suppose you did all three actions on the same video: then using video:{$ne : null} You WILL get the liked video.
    //You will NOT get likes on comments or tweets using this query
    // You will NOT get comments themselves (those are not stored in the Like collection).

    // what if we dont apply $ne: null?? then we will get all docs by the user including likes on videos, likes on comments, like on tweets
  }).populate("video");
  // this populate video will gives everything about the video like: url, title instead of only getting the videos ID

  if(!likeVideos || likeVideos.length === 0){
    throw new APIError("No liked videos found", 404)
  }

  return res
  .status(200)
  .json(new APIresponse(200, {}, "Only likes Videos fetched successfully!"))
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };