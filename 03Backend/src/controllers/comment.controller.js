import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { APIError } from "../utils/APIError.js";
import { APIresponse } from "../utils/APIresponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { skip } from "node:test";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError("video does not exist", 400);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const comments = await Comment.find({ video: videoId })
    .sort({ createdAt: -1 })
    // .page(page)        this type of thing does exist in mongoose
    .skip(skip) // not that skip should come before limit but since you are using both limit and skip then no problem
    .limit(limit);

  return res
    .status(200)
    .json(
      new APIresponse(
        200,
        { page, limit, comments },
        "Video comments fetched Successfully"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  const { videoId, content } = req.body;

  if (!videoId || !content) {
    throw new APIError("Video or Content is missing", 400);
  }

  const newComment = await Comment.create({
    video: videoId,
    content: content,
    owner: user._id,
  });

  return res
    .status(200)
    .json(new APIresponse(201, { comment: newComment }, "Comment added!"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  const { commentId, newContent } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new APIError("Comment not found", 404);
  }

  if (String(comment.owner) !== String(user._id)) {
    throw new APIError("This comment does not belong to the owner", 400);
  }

  comment.content = newContent;
  await comment.save();

  return res
    .status(200)
    .json(new APIresponse(200, { comment }, "Comment updated!"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new APIError("User not found", 400);
  }

  const { commentId } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new APIError("Comment does not exists", 400);
  }

  if (String(comment.owner) !== String(user._id)) {
    throw new APIError("This comment does not belogns to the owner", 400);
  }

  await comment.deleteOne();

  return res
    .status(200)
    .json(new APIresponse(200, {}, "Comment deleted Successfully!"));
});

export { getVideoComments, addComment, updateComment, deleteComment };