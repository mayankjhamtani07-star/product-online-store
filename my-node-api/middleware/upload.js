const multer = require("multer");
const path = require("path");
const fs = require("fs");

const baseUploadPath = path.join(__dirname, "../../uploads");

const createUpload = (folder, allowedTypes = ["image/jpeg", "image/png", "image/webp"], fileSize = 3 * 1024 * 1024) => {
    const uploadPath = path.join(baseUploadPath, folder);
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, baseUploadPath),
        filename: (req, file, cb) => cb(null, `${folder}/${Date.now()}-${file.originalname}`),
    });

    return multer({
        storage,
        limits: { fileSize },
        fileFilter: (req, file, cb) => {
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error(`File type ${file.mimetype} not allowed. Only ${allowedTypes.join(", ")} are supported.`), false);
            }
        },
    });
};

const ticketUpload = createUpload("tickets", ["image/jpeg", "image/png", "image/webp", "application/pdf"], 3 * 1024 * 1024);

module.exports = { createUpload, ticketUpload };
