import express from "express";
import {
  addBlog,
  updateBlog,
  addComment,
  deleteBlogById,
  generateContent,
  getAllBlogs,
  getBlogById,
  getBlogComments,
  getMyBlogs,
  togglePublish,
  deleteUserComment,
  updateComment,
} from "../controllers/blogController.js";

import upload from "../middleware/multer.js";
import auth from "../middleware/auth.js";

const blogRouter = express.Router();

/* ===========================
   Public Routes
=========================== */

// Get all published blogs
blogRouter.get("/all", getAllBlogs);

// Get comments for a blog
blogRouter.post("/comments", getBlogComments);

// Add comment (auth required — stores user for ownership)
blogRouter.post("/add-comment", auth, addComment);

/* ===========================
   Protected User Routes
   NOTE: Specific routes MUST be declared before /:blogId
   Otherwise Express matches /myblogs as blogId="myblogs"
=========================== */

// Get logged-in user's own blogs  ← must be before /:blogId
blogRouter.get("/myblogs", auth, getMyBlogs);

// Add new blog (auth required — assigns author automatically)
blogRouter.post("/add", auth, upload.single("image"), addBlog);

// Update own blog (auth required — ownership verified in controller)
blogRouter.put("/update/:id", auth, upload.single("image"), updateBlog);

// Delete own blog (auth required — ownership verified in controller)
blogRouter.post("/delete", auth, deleteBlogById);

// Publish / Unpublish own blog
blogRouter.post("/toggle-publish", auth, togglePublish);

// Delete own comment
blogRouter.delete("/comment/:id", auth, deleteUserComment);

// Edit own comment
blogRouter.put("/comment/:id", auth, updateComment);

// AI Blog Generator
blogRouter.post("/generate", auth, generateContent);

/* ===========================
   Dynamic Route — MUST be last
   Otherwise it swallows /myblogs, /all, etc.
=========================== */

// Get single blog by ID
blogRouter.get("/:blogId", getBlogById);

export default blogRouter;
