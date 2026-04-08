const express = require("express");
const router = express.Router();
const adminAuth = require("../middleware/adminAuth");
const { createUpload } = require("../middleware/upload");
const upload = createUpload("products");
const {
    loginAdmin, getDashboardStats,
    getAllUsers, deactivateUser, activateUser,
    getAllProducts, filterAdminProducts, deactivateProduct, activateProduct,
    getAllExperiences, getExperienceDetail, deactivateExperience, activateExperience,
    createProduct, updateProduct, getAllLeads,
    getAllTickets, getTicketDetail, updateTicketStatus, addReply,
    getAllTicketsFire, getTicketDetailFire, updateTicketStatusFire, addReplyFire
} = require("../controllers/adminController");

router.post("/login", loginAdmin);

router.get("/stats", adminAuth, getDashboardStats);

router.get("/users", adminAuth, getAllUsers);
router.put("/users/:id/deactivate", adminAuth, deactivateUser);
router.put("/users/:id/activate", adminAuth, activateUser);

router.get("/products", adminAuth, getAllProducts);
router.get("/products/filter", adminAuth, filterAdminProducts);
router.post("/products", adminAuth, upload.single("image"), createProduct);
router.put("/products/:id", adminAuth, upload.single("image"), updateProduct);
router.put("/products/:id/deactivate", adminAuth, deactivateProduct);
router.put("/products/:id/activate", adminAuth, activateProduct);

router.get("/experiences", adminAuth, getAllExperiences);
router.get("/experiences/:id", adminAuth, getExperienceDetail);
router.put("/experiences/:id/deactivate", adminAuth, deactivateExperience);
router.put("/experiences/:id/activate", adminAuth, activateExperience);

router.get("/leads", adminAuth, getAllLeads);

router.get("/tickets", adminAuth, getAllTickets);
router.get("/tickets/:id", adminAuth, getTicketDetail);
router.put("/tickets/:id/status", adminAuth, updateTicketStatus);
router.post("/tickets/:id/reply", adminAuth, addReply);

router.get("/tickets-fire", adminAuth, getAllTicketsFire);
router.get("/tickets-fire/:id", adminAuth, getTicketDetailFire);
router.put("/tickets-fire/:id/status", adminAuth, updateTicketStatusFire);
router.post("/tickets-fire/:id/reply", adminAuth, addReplyFire);

module.exports = router;
