import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import {User} from "../models/user.model.js";
import uploadToCloudinary from "../utils/Cloudinary.js";
import { APIresponse } from "../utils/APIresponse.js"; 


const registerUser = asyncHandler(async (req, res) => {
  console.log("registerUser controller called");

  const { fullName, email, password, username } = req.body;
  console.log("email : ", email);

  if (!fullName || !email || !password || !username) {
    throw new APIError("All fields are required", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new APIError("User with this email already exists", 400);
  }

  // these below are the properties of multer
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
  }
  

  if (!avatarLocalPath) {
      throw new APIError(400, "Avatar file is required")
  }

  const avatar = await uploadToCloudinary(avatarLocalPath)
  const coverImage = await uploadToCloudinary(coverImageLocalPath)

  if (!avatar) {
      throw new APIError(400, "Avatar file is required")
  }

  const newUser = await User.create({
    fullName,
    email,
    password,
    username,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });

  console.log("New user created:", newUser);

  // if (!newUser) {
  //   throw new ApiError("User registration failed", 500);
  // }

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");
  if (!createdUser) {
    throw new APIError("User not found after creation", 404);
  }

  
  return res.status(201).json(
    new APIresponse(200, "User registered successfully", createdUser)
  );
});

export { registerUser };
