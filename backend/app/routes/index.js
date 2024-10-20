const express = require("express");
const router = express.Router();
const authController = require("../controllers/user.controller");
const middleware = require("../middlewares/middleware")

router.route("/login").post(authController.login);
router.route("/logout").post(middleware.verifyToken, authController.logout);
router.route("/register").post(authController.register);
router.route("/refresh").post(authController.refreshToken);
router.route("/enable-mfa").post(authController.enableMFA);
router.route("/verify-mfa").post(authController.verifyMFA);
module.exports = router;
