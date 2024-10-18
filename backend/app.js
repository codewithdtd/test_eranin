const express = require("express");
const cors = require("cors");
const apiRoutes = require('./app/routes')
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({ message: "Test Eranin" });
});

app.use('/api', apiRoutes)

app.use((err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;