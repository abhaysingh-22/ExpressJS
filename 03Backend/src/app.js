import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
}));

app.use(express.json({
    limit: "50mb",
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb",
}));

app.use(express.static("public"));
app.use(cookieParser());


// Import routes
//routes declaration
app.use("/api/v1/users", userRoutes);

export { app };