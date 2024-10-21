const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

const User = require("../models/user.model");
const ApiError = require("../api-error");

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    // Kiểm tra nếu người dùng không tồn tại
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }
    // Kiểm tra nếu người dùng đã kích hoạt MFA
    if (user.mfaEnabled) {
      return res.status(200).json({ mfaEnabled: true, userId: user._id, email: user.email });
    }
     // Loại bỏ mật khẩu trước khi gửi phản hồi
    // const { password, ...userWithoutPassword } = user._doc;
    // const token = jwt.sign({ userId: user._id }, "secretkey", { expiresIn: "1h" });
    const newUser = {
      userId: user._id,
      email: user.email,
      mfaEnabled: user.mfaEnabled,
    };
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.register = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = new User({ email, password });
    const exits = await User.findOne({ email: email });

    if (exits) {
      res.status(409).json({ message: "Tài khoản đã tồn tại !!!" });
    } else {
      await user.save();
      res.status(201).json({ message: "User registered" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.enableMFA = async (req, res, next) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = speakeasy.generateSecret({ name: "MFA user" });
    user.mfaSecret = secret.base32;
    // user.mfaEnabled = true;
    await user.save();

    // Tạo mã QR cho ứng dụng xác thực
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.status(200).json({ qrCodeDataUrl });
  } catch (error) {
    res.status(500).json({ message: "Error enabling MFA" });
  }
};

exports.verifyMFA = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.mfaEnabled) {
      return res.status(404).json({ message: "MFA not enabled" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token: otp,
    });

    if (!verified) {
      return res.status(401).json({ message: "Invalid MFA token" });
    }
    user.mfaEnabled = true;
    await user.save();


    // const jwtToken = jwt.sign({ userId: user._id }, "secretkey", {
    //   expiresIn: "1h",
    // });
    const accessToken = jwt.sign(
        {
            id: userId,
            // role: result.role
        },  
        process.env.JWT_ACCESS_TOKEN,
        { expiresIn: "900s" }
    );
    // refresh
    const refreshToken = jwt.sign(
        {
            id: userId,
            // role: result.role
        },  
        process.env.JWT_REFRESH_TOKEN,
        { expiresIn: "30d" }
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ token: accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.logout = async (req, res, next) => {
  console.log('logout')
  res.clearCookie("refreshToken");
  res.send({ message: "Logout" });
};

exports.refreshToken = async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) {
      console.log('khong ton tai')
        return next(
            new ApiError(401, "You're not authenticated!")
        );
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, user) => {
        if(err) {
            return next(
                new ApiError(403, "Token is not valid!")
            );
        }
        const newAccessToken = jwt.sign(
            {
                id: user.id,
                // role: result.role
            },  
            process.env.JWT_ACCESS_TOKEN,
            { expiresIn: "900s" }
        );
        // refresh
        const newRefreshToken = jwt.sign(
            {
                id: user.id,
                // role: result.role
            },  
            process.env.JWT_REFRESH_TOKEN,
            { expiresIn: "30d" }
        );

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({accessToken: newAccessToken});
    })

}