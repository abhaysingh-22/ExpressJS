import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import { User } from "../models/user.model.js";
import uploadToCloudinary from "../utils/Cloudinary.js";
import { APIresponse } from "../utils/APIresponse.js";
import jwt from "jsonwebtoken";

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
  // console.log("Logout controller hit");
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
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

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body;

  if (!incomingRefreshToken) {
    throw new APIError("Unauthorized Request", 401);
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = User.findById(decodedToken?._id);

    if (!user) {
      throw new APIError("Invalid refresh Token", 401);
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new APIError("refresh Token is expired or already used", 401);
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new APIresponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new APIError(401, error?.message || "Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new APIError("Invalid Password", 400);
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new APIresponse(200, {}, "Password Changed Succesfuly!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new APIresponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetail = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new APIError("All Fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.User?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new APIresponse(200, user, "Account details Uploaded Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new APIError("Avatar file is missing", 400);
  }

  const user = await User.findById(req.user._id);

  if (user.avatar) {
    const public_id = getPublicIdFromUrl(user.avatar);

    if (public_id) {
      await deleteFromCloudinary(public_id);
    }
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new APIError("Error while uploading on Avatar", 400);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new APIresponse(200, updatedUser, "Avatar image updated Successfully")
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new APIError("Cover Image file Missing", 400);
  }

  const user = await User.findById(req.user._id);

  if (user.coverImage) {
    const public_id = getPublicIdFromUrl(user.coverImage);

    if (public_id) {
      await deleteFromCloudinary(public_id);
    }
  }

  const coverImage = await uploadToCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new APIError("Error while uploading Cover Image", 400);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new APIresponse(200, updatedUser, "Cover Image updated Successfully!")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new APIError("Username is Missing", 400);
  }

  // now to get informations like number of subscribers does user have and number of channels the user has subscribed, username etc we need to use aggerate pipelines

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if(!channel?.length()){
    throw new APIError("channel does not exist", 400)
  }

  return res
  .status(200)
  .json(new APIresponse(200, channel[0], "User channel fetched Successfully"))

});



export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
};
