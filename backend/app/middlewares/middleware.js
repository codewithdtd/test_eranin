const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

exports.verifyToken = async (req, res, next) => {
    const token = req.headers.authorization;
    if(token) {
        const accessToken = token.split(" ")[1];
        jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, (err, user) => {
            if(err) {
                return next(
                    new ApiError(403, "Token is not valid!")
                );
            }
            req.user = user;
            console.log(user)
            next();
        })
    }
    else {
        return next(
            new ApiError(401, "You're not authenticated!")
        );
    }
}
