require('dotenv').config(); // Load environment variables from .env file
const express = require("express");
const app = express();
const port = 4000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  res.send("Hello from API!");
});

app.get("/login", (req, res) => {
  res.send("<h1>Hello from Login!</h1>");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT}`);
});
