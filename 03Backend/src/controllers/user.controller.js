import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/Cloudinary.js";
import { APIresponse } from "../utils/APIresponse.js";

console.log("User controller loaded");

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, username } = req.body;

  if (!fullName || !email || !password || !username) {
    throw new APIError("All fields are required", 400);
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existingUser) {
    throw new APIError("User with this email or username already exists", 409);
  }

  let coverImageLocalPath, avatarLocalPath;

  if (req.files?.coverImage?.[0]?.path) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (req.files?.avatar?.[0]?.path) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  let avatar, coverImage;

  if (avatarLocalPath) {
    avatar = await uploadToCloudinary(avatarLocalPath);
  }
  if (coverImageLocalPath) {
    coverImage = await uploadToCloudinary(coverImageLocalPath);
  }

  const user = await User.create({
    fullName,
    avatar: avatar?.url || "",
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new APIError("Something went wrong while registering the user", 500);
  }

  return res
    .status(201)
    .json( new APIresponse(200, "User registered successfully", createdUser));
});

export { registerUser };

