import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  if (!channelId) {
    throw new APIError("Channel not found", 400);
  }

  const alreadySubsrciber = await Subscription.findOne({
    subscriber: user._id,
    channel: channelId,
  });

  if (alreadySubsrciber) {
    await alreadySubsrciber.deleteOne();
    return res
      .status(200)
      .json(new APIresponse(200, {}, "Unsubscribed Successfully"));
  } else {
    await Subscription.create({
      subscriber: user._id,
      channel: channelId,
    });
    return res
      .status(200)
      .json(new APIresponse(200, {}, "Subscribed Successfully"));
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  if (!channelId) {
    throw new APIError("Channel not found", 400);
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate(
    "subscriber",
    "username fullName avatar"
  );

  const countSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  return res
    .status(200)
    .json(
      new APIresponse(
        200,
        { subscribers, countSubscribers },
        "Subscribers details successfully fetched"
      )
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  if (!subscriberId) {
    throw new APIError("Subscriber does not exist", 400);
  }

  const subscribedChannel = await Subscription.find({
    subscriber: subscriberId,
  }).populate("channel", "username fullName avatar");    // correct syntax for this is you want to populate channel field and select the specific fields from it.

  const countsubscribedChannel = await Subscription.countDocuments({
    subscriber: subscriberId,
  });

  return res
    .status(200)
    .json(
      new APIresponse(
        200,
        { subscribedChannel, countsubscribedChannel },
        "All subscribed channels successfully fetched!"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };