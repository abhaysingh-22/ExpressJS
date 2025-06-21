import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:8000",
    credentials: true,
}));

app.use(express.urlencoded({
    extended: true,
    limit: "50mb",
}));


const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());


import userRoutes from "./routes/user.routes.js";


app.use("/api/v1/users", userRoutes);



app.use((err, req, res, next) => {
  console.error(err); // This will print the full error in your terminal
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export { app };