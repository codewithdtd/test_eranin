const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const apiRoutes = require("./app/routes");
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:8080', // Địa chỉ frontend
  credentials: true, // Cho phép gửi cookie
}));


app.get("/", (req, res) => {
  res.json({ message: "Test Eranin" });
});

app.use("/auth", apiRoutes);

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
