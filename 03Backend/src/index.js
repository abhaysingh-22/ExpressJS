//this is a good practise to keep the process of connection to the database and server startup in a separate file but there is one more way to do it

/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}`, {
            dbName: `${DB_NAME}`
        });
        app.on("error", (err) => {
            console.error("MongoDB connection error:", err);
            throw err;
        });

        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server is running on port ${process.env.PORT || 3000}`);
        }); 
    }catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
})();

*/








import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import connectToDatabase from "./db/index.js";
import { app } from "./app.js"; 

connectToDatabase()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1); // Exit the process with failure
  });
