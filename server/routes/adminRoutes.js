import express from "express";
import {
  adminLogin,
  approvedCommentById,
  deleteCommentById,
  getAllBlogsAdmin,
  getAllComments,
  getDashboard,
  deleteBlogByAdmin,
  togglePublishByAdmin,
} from "../controllers/adminController.js";
import adminAuth from "../middleware/adminAuth.js";

const adminRouter = express.Router();

// Public — no auth needed
adminRouter.post("/login", adminLogin);
adminRouter.get("/comments", getAllComments);

// Protected — admin-only routes
adminRouter.get("/blogs", adminAuth, getAllBlogsAdmin);
adminRouter.post("/delete-comment", adminAuth, deleteCommentById);
adminRouter.post("/approve-comment", adminAuth, approvedCommentById);
adminRouter.get("/dashboard", adminAuth, getDashboard);

// Admin moderation — delete or toggle any blog regardless of owner
adminRouter.delete("/blog/:id", adminAuth, deleteBlogByAdmin);
adminRouter.patch("/blog/toggle-publish/:id", adminAuth, togglePublishByAdmin);

export default adminRouter;
