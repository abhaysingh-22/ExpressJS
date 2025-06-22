import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { timeStamp } from "console";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { tweetContent } = req.body;

  if (!tweetContent) {
    throw new APIError("No tweet recived", 400);
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  const tweet = await Tweet.create({
    content: tweetContent,
    owner: user._id,
  });

  return res
    .status(201)
    .json(new APIresponse(201, tweet, "Tweet successfully created"));
  //Why pass tweet?
  // The frontend/client often needs the details of the newly created tweet (like its _id, content, owner, timestamps, etc.) to update the UI immediately.
  // It confirms to the client that the tweet was created and provides all relevant data.
  // If you don’t pass tweet:
  // The client will only get the success message, but not the actual tweet data.
  // If the client needs the tweet data, it would have to make another API call to fetch it.
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const tweets = await Tweet.find({ owner: user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(
      new APIresponse(
        200,
        { tweets, page, limit },
        "User tweets fetched Successfully"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  const { tweetId, newContent } = req.body;

  if (!tweetId || !newContent) {
    throw new APIError("Tweet ID and new content are required", 400);
  }

  const tweet = await Tweet.findById(tweetId)

  if(!tweet){
    throw new APIresponse("Invalid or id not found", 400)
  }

  if(tweet.owner.toString() !== user._id.toString()){
    throw new APIError("Unauthorized User", 400)
  }

  tweet.content = newContent
  await tweet.save()

  return res
  .status(200)
  .json(new APIresponse(200, {tweet}, "Tweet successfully updated"))
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  const {tweetId} = req.body

  if (!tweetId) {
    throw new APIError("Tweet ID and new content are required", 400);
  }

  const tweet = await Tweet.findById(tweetId)

  if(tweet.owner.toString() !== user._id.toString()){
    throw new APIError("Unauthorized User", 400)
  }

  await tweet.deleteOne()

  return res
  .status(200)
  .json(new APIresponse(200, {}, "Tweet successfully deleted"))
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };