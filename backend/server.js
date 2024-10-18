const app = require("./app");
const {config, connectDB} = require("./app/config");
// const MongoDB = require("./app/utils");

async function startServer() {
    try {
        // await MongoDB.connect(config.db.uri);
        // console.log("Connected to the database");
        connectDB();
        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.log("Cannot connect to the database!", error);
        process.exit();
    }
}

startServer()