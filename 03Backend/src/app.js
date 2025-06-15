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

// Add this at the end of your middleware stack
app.use((err, req, res, next) => {
  console.error(err); // This will print the full error in your terminal
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    // error: err, // Uncomment for debugging, but remove in production
  });
});

export { app };