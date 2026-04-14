const asyncHandler = require("../utils/asyncHandler");
const crypto = require("crypto");
const db = require("../services/db");
const sendEmail = require("../utils/sendEmail");

exports.createExperience = asyncHandler(async (req, res) => {
    const { expname, title, description, productIds } = req.body;
    if (!expname || !title || !description) return res.status(400).json({ message: "All fields are required" });
    const parsedIds = productIds ? (typeof productIds === "string" ? JSON.parse(productIds) : productIds) : [];
    const existing = await db.findExpByName(expname);
    if (existing) return res.status(409).json({ message: "Experience already exists" });
    const image = req.file ? req.file.filename : "";
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    const experience = await db.createExp({ expname, title, description, productIds: parsedIds, image, code });
    await db.createMember({ role: "admin", expid: experience._id, userid: req.user._id, invitedby: null, invitedsource: null, status: "accepted" });
    res.status(201).json({ message: "Experience Created Successfully", experience });
});

const getExperienceList = (isArchived) => asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const all = await db.findMembersByUser(req.user._id, isArchived);
    const active = all.filter(e => e.expid !== null);
    const total = active.length;
    const data = active.slice(skip, skip + limit);
    const dataWithCount = await Promise.all(data.map(async (mem) => {
        const memberCount = await db.countMembersByExp(mem.expid._id);
        return { ...mem.toObject(), memberCount };
    }));
    res.status(200).json({ data: dataWithCount, total });
});

exports.getExperience = getExperienceList(false);
exports.getArchieveExperience = getExperienceList(true);

exports.ArchieveExperience = asyncHandler(async (req, res) => {
    const requester = await db.findMember(req.params.id, req.user._id);
    if (!requester) return res.status(403).json({ message: "Access denied" });
    requester.isArchieved = true;
    await requester.save();
    res.status(200).json({ message: "Experience archived successfully" });
});

exports.UnarchieveExperience = asyncHandler(async (req, res) => {
    const requester = await db.findMember(req.params.id, req.user._id);
    if (!requester) return res.status(403).json({ message: "Access denied" });
    requester.isArchieved = false;
    await requester.save();
    res.status(200).json({ message: "Experience unarchived successfully" });
});

exports.getExistExperience = asyncHandler(async (req, res) => {
    const experiences = await db.findAdminMembersByUser(req.user._id);
    const active = experiences.filter(e => e.expid !== null);
    res.status(200).json(active);
});

exports.getExperienceById = asyncHandler(async (req, res) => {
    const { _id: uid } = req.user;
    const expid = req.params.id;
    const requester = await db.findMember(expid, uid);
    if (!requester) return res.status(403).json({ message: "Access denied" });
    const exp = await db.findExpByIdPopulated(expid);
    if (!exp) return res.status(404).json({ message: "Experience not found" });
    const members = await db.findMembersByExp(expid);
    const wishList = await db.findWishIdsByUser(uid);
    const wishedIds = new Set(wishList.map(w => w.productid.toString()));
    const expObj = exp.toObject();
    expObj.productIds = expObj.productIds.map(p => ({ ...p, wishlisted: wishedIds.has(p._id.toString()) }));
    res.status(200).json({ exp: expObj, members, myRole: requester.role });
});

exports.addProductInExp = asyncHandler(async (req, res) => {
    const { productId, expid } = req.body;
    const experience = await db.findExpById(expid);
    if (!experience) return res.status(404).json({ message: "Invalid Experience" });
    if (experience.productIds.includes(productId)) return res.status(409).json({ message: "Product already in experience" });
    experience.productIds.push(productId);
    await experience.save();
    res.status(200).json({ message: "Product added to experience", experience });
});

exports.delUserExp = asyncHandler(async (req, res) => {
    const { memId, expid } = req.body;
    const experience = await db.findExpById(expid);
    if (!experience) return res.status(404).json({ message: "Invalid Experience" });
    const member = await db.findMember(expid, memId);
    if (!member) return res.status(400).json({ message: "User not in this experience" });
    await db.deleteMemberById(member._id);
    res.status(200).json({ message: "Member deleted from this Experience" });
});

exports.updateExperience = asyncHandler(async (req, res) => {
    const { expname, title, description } = req.body;
    const exp = await db.findExpById(req.params.id);
    if (!exp) return res.status(404).json({ message: "Experience not found" });
    const member = await db.findMember(exp._id, req.user._id);
    if (!member || member.role !== "admin") return res.status(403).json({ message: "Only admin can edit this experience" });
    if (expname && expname !== exp.expname) {
        const exists = await db.findExpByName(expname);
        if (exists) return res.status(409).json({ message: "Experience name already taken" });
    }
    exp.expname = expname || exp.expname;
    exp.title = title || exp.title;
    exp.description = description || exp.description;
    if (req.file) exp.image = req.file.filename;
    await exp.save();
    res.status(200).json({ message: "Experience updated successfully" });
});

exports.delExp = asyncHandler(async (req, res) => {
    const exp = await db.findExpById(req.params.id);
    if (!exp) return res.status(404).json({ message: "Invalid Experience" });
    exp.status = "Inactive";
    await exp.save();
    res.status(200).json({ message: "Experience Deleted Successfully" });
});

exports.useInviteCode = asyncHandler(async (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "Invite code required" });
    const experience = await db.findExpByCode(code);
    if (!experience) return res.status(404).json({ message: "Invalid code" });
    const existing = await db.findMember(experience._id, req.user._id);
    if (existing) {
        if (existing.status === "accepted") return res.status(409).json({ message: "You are already a member of this experience" });
        existing.status = "accepted";
        await existing.save();
        return res.status(200).json({ message: "Invite code applied successfully" });
    }
    const adminMember = await db.findAdminOfExp(experience._id);
    await db.createMember({ expid: experience._id, userid: req.user._id, status: "accepted", invitedsource: "code", invitedby: adminMember?.userid || null });
    res.status(200).json({ message: "Invite code applied successfully" });
});

exports.sendInviteEmail = asyncHandler(async (req, res) => {
    const { email, expid } = req.body;
    if (!email || !expid) return res.status(400).json({ message: "Email and Experience ID required" });
    const experience = await db.findExpById(expid);
    if (!experience) return res.status(404).json({ message: "Invalid Experience" });
    const user= await db.findUserByEmail(email);
    if(!user) return res.status(404).json({ message: "User with this email not found" });
    const existing = await db.findMember(expid, user._id);
    if (existing){
        if(existing.status === "pending") {
            
            return res.status(409).json({ message: "Invitation already sent" });
        }
        return res.status(409).json({ message: "User is already a member of this experience" });
    }
    await db.createMember({ expid: experience._id, userid: user._id, status: "pending", invitedby: req.user._id, invitedsource: "email" });

    // Here you would integrate with an email service to send the invite email containing experience.code
    await sendEmail(user.email, "Experience Invite", `You have been invited to join the experience: ${experience.expname}. Use the invite code: ${experience.code} to join.`).catch(console.error);

    res.status(200).json({ message: "Invite email sent successfully" });
});