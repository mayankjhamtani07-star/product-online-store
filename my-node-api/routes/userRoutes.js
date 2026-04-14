const express= require("express");
const router = express.Router();
const auth=require("../middleware/auth");

const {createUser, loginUser, getMe, updateMe, updatePassword, forgotPassword, resetPassword, saveFcmToken} = require("../controllers/userControlers");
const { createUpload } = require("../middleware/upload");
const upload = createUpload("users");

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/me", auth, getMe);
router.put("/me", auth, upload.single("image"), updateMe);
router.put("/password", auth, updatePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.post("/fcm-token", auth, saveFcmToken);

module.exports = router;