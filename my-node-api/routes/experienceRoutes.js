const express= require("express");
const router= express.Router();
const auth=require("../middleware/auth");
const { createUpload } = require("../middleware/upload");
const upload = createUpload("experiences");

const { createExperience, getExperience, delUserExp, delExp, getExperienceById, useInviteCode, getExistExperience, addProductInExp, updateExperience, getArchieveExperience, ArchieveExperience, UnarchieveExperience } = require("../controllers/experienceControlers");

router.post("/", auth, upload.single("image"), createExperience);
router.post("/join", auth, useInviteCode);
router.post("/add-product", auth, addProductInExp);
router.post("/archive/:id", auth, ArchieveExperience);
router.post("/unarchive/:id", auth, UnarchieveExperience);
router.get("/", auth, getExperience);
router.get("/archived", auth, getArchieveExperience);
router.get("/exist", auth, getExistExperience);
router.get("/:id", auth, getExperienceById);
router.delete("/removeuser", auth, delUserExp);
router.put("/:id", auth, upload.single("image"), updateExperience);
router.delete("/delete/:id", auth, delExp);
module.exports = router;
