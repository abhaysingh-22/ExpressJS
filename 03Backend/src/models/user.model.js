import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index : true   // Adding index for faster lookups if you want to search by username
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: 6
    },
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
        index: true
    },
    avatar: {
        type: String,   //we will use cloudinary for storing images
        required: true, // Avatar is optional
    },
    coverImage: {
        type: String,   
        required: true,
    },
    watchHistory: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    refreshToken: {
        type: String,
        },

}, {timestamps: true});


userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {                      //avoid using arrow function here because we know that in arrow functions we can npot use "this"
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ id: this._id, email: this.email, username: this.username, fullName: this.fullName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    return token;  
};

userSchema.methods.generateRefreshToken = function () {
    const token = jwt.sign({ id: this._id, email: this.email, username: this.username, fullName: this.fullName }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
    return token;
};

export const User = mongoose.model("User", userSchema);