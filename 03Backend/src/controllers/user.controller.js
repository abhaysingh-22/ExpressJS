import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/Cloudinary.js";
import { APIresponse } from "../utils/APIresponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(
      500,
      "Something went wrong while generating the access and the refresh token"
    );
  }
};

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
    .json(new APIresponse(200, "User registered successfully", createdUser));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!(email || username)) {
    throw new APIError("username or email is required", 400);
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new APIError("User does not exist", 404);
  }

  const correctPassword = await user.isPasswordCorrect(password);

  if (!correctPassword) {
    throw new APIError("Password Incorrect", 401);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); // by this we can control that what we don't want to share the information to the user

  // sending cookies to the user
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new APIresponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "You have Successfully logged your id"
      )
    );
});

// for logging out a user we need to remove the cookies and the refresh token and we need to create a middleware for this
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIresponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };