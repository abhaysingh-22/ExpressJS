import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import cloudinary from "../utils/Cloudinary.js";
import { APIresponse } from "../utils/APIresponse.js"; 

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, username } = req.body;
  console.log("email : ", email);

  if (!fullName || !email || !password || !username) {
    throw new ApiError("All fields are required", 400);
  }

  const existingUser = User.findOne({ email }).then((existingUser) => {
    if (existingUser) {
      throw new ApiError("User with this email already exists", 400);
    }
  });

  // these below are the properties of multer
  const avatarPath = req.files?.avatar[0]?.path;
  const coverImagePath = req.files?.coverImage[0]?.path;

  if (!avatarPath || !coverImagePath) {
    throw new ApiError("Avatar and cover image are required", 400);
  }

  const avatarUrl = await cloudinary(avatarPath);
  const coverImageUrl = await cloudinary(coverImagePath);

  if(!avatarUrl || !coverImageUrl) {
    throw new ApiError("Error uploading images", 500);
  }

  const newUser = await User.create({
    fullName,
    email,
    password,
    username,
    avatar: avatarUrl || "",
    coverImage: coverImageUrl || "",
  });

  // if (!newUser) {
  //   throw new ApiError("User registration failed", 500);
  // }

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new ApiError("User not found after creation", 404);
  }

  
  return res.status(200).json(
    new APIresponse(200, "User registered successfully", createdUser)
  );
});

export { registerUser };