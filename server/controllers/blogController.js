import fs from "fs";
import imagekit from "../configs/imageKit.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import main from "../configs/gemini.js";

/* ===========================
   Add New Blog
=========================== */
export const addBlog = async (req, res) => {
  try {
    const { title, subTitle, description, category, isPublished } = JSON.parse(
      req.body.blog
    );

    const imageFile = req.file;

    if (!title || !description || !category || !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const fileBuffer = fs.readFileSync(imageFile.path);

    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: imageFile.originalname,
      folder: "/blogs",
    });

    const image = imagekit.url({
      path: response.filePath,
      transformation: [
        { quality: "auto" },
        { format: "webp" },
        { width: "1280" },
      ],
    });

    const blog = await Blog.create({
      title,
      subTitle,
      description,
      category,
      image,
      isPublished,
      author: req.userId, // Logged-in user becomes author
    });

    return res.status(201).json({
      success: true,
      message: "Blog added successfully",
      blog,
    });
  } catch (error) {
    console.error('addBlog error:', error.message, error.stack);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Update Blog (owner only)
=========================== */
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Only the owner can edit their blog
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const { title, subTitle, description, category, isPublished } = req.body;

    // Update text fields
    if (title) blog.title = title;
    if (subTitle !== undefined) blog.subTitle = subTitle;
    if (description) blog.description = description;
    if (category) blog.category = category;
    if (isPublished !== undefined) blog.isPublished = isPublished;

    // If a new image was uploaded, process and replace it
    if (req.file) {
      const fileBuffer = fs.readFileSync(req.file.path);

      const response = await imagekit.upload({
        file: fileBuffer,
        fileName: req.file.originalname,
        folder: "/blogs",
      });

      blog.image = imagekit.url({
        path: response.filePath,
        transformation: [
          { quality: "auto" },
          { format: "webp" },
          { width: "1280" },
        ],
      });
    }

    await blog.save();

    return res.json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   Get All Published Blogs
=========================== */
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      isPublished: true,
    })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Get Single Blog
=========================== */
export const getBlogById = async (req, res) => {
  try {
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId).populate(
      "author",
      "name email"
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    return res.json({
      success: true,
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Get Logged-in User Blogs
=========================== */
export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      author: req.userId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      blogs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Delete Blog (owner only)
=========================== */
export const deleteBlogById = async (req, res) => {
  try {
    const { id } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Only owner can delete
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await blog.deleteOne();

    // Remove all comments for this blog
    await Comment.deleteMany({ blog: id });

    return res.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Publish / Unpublish Blog (owner only)
=========================== */
export const togglePublish = async (req, res) => {
  try {
    const { id } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    // Only owner can publish
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    blog.isPublished = !blog.isPublished;

    await blog.save();

    return res.json({
      success: true,
      message: "Blog status updated",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Add Comment (auth required)
   Stores user reference for ownership
=========================== */
export const addComment = async (req, res) => {
  try {
    const { blog, name, content } = req.body;

    if (!blog || !name || !content) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    await Comment.create({
      blog,
      name,
      content,
      user: req.userId, // attach the logged-in user's ID for ownership
    });

    return res.json({
      success: true,
      message: "Comment added for review",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Get Blog Comments (public)
=========================== */
export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.body;

    const comments = await Comment.find({
      blog: blogId,
      isApproved: true,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      comments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ===========================
   Delete Own Comment (user only)
=========================== */
export const deleteUserComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Only the comment owner can delete it
    if (!comment.user || comment.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await comment.deleteOne();

    return res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   Edit Own Comment (user only)
=========================== */
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Only the comment owner can edit it
    if (!comment.user || comment.user.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    comment.content = content;
    comment.isApproved = false; // Re-submit for admin review after edit

    await comment.save();

    return res.json({ success: true, message: "Comment updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ===========================
   Generate Blog Content (AI)
=========================== */
export const generateContent = async (req, res) => {
  try {
    const { prompt } = req.body;

    const content = await main(
      `${prompt}. Generate a blog article in simple text format.`
    );

    return res.json({
      success: true,
      content,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};