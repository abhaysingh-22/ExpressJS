import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";

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

  res.status(200).json({
    message: "User registered successfully",
  });
});

export { registerUser };