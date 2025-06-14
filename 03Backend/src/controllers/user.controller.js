import {asyncHandler} from '../utils/asyncHandler.js';

const registerUser = asyncHandler(async (req, res) => {
    console.log(("User registration request received"));
  res.status(200).json({
    message: "User registered successfully"
  });
});

export { registerUser };