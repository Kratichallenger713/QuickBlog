import generateToken from '../utils/generateToken.js';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';


/* ===========================
   Admin Login
=========================== */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return res.json({ success: false, message: "Invalid Credentials" })
    }
    const token = generateToken({ email });
    res.json({ success: true, token })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* ===========================
   Get All Blogs (Admin)
=========================== */
export const getAllBlogsAdmin = async (req, res) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 })
    res.json({ success: true, blogs })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* ===========================
   Delete Any Blog (Admin — no ownership check)
   Admin can remove any blog for social/legal moderation
=========================== */
export const deleteBlogByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    await blog.deleteOne();

    // Also remove all comments on this blog
    await Comment.deleteMany({ blog: id });

    res.json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* ===========================
   Toggle Publish Any Blog (Admin — no ownership check)
=========================== */
export const togglePublishByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    blog.isPublished = !blog.isPublished;
    await blog.save();

    res.json({ success: true, message: "Blog status updated", blog });
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* ===========================
   Get All Comments (Admin)
=========================== */
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find({}).populate("blog").sort({ createdAt: -1 })
    res.json({ success: true, comments })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* ===========================
   Get Dashboard Stats (Admin)
=========================== */
export const getDashboard = async (req, res) => {
  try {
    const recentBlogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5);
    const blogs = await Blog.countDocuments();
    const comments = await Comment.countDocuments()
    const drafts = await Blog.countDocuments({ isPublished: false })
    const dashboardData = { blogs, comments, drafts, recentBlogs }
    res.json({ success: true, dashboardData })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* ===========================
   Delete Any Comment (Admin)
=========================== */
export const deleteCommentById = async (req, res) => {
  try {
    const { id } = req.body;
    await Comment.findByIdAndDelete(id);
    res.json({ success: true, message: "Comment deleted successfully" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}

/* ===========================
   Approve Comment (Admin)
=========================== */
export const approvedCommentById = async (req, res) => {
  try {
    const { id } = req.body;
    await Comment.findByIdAndUpdate(id, { isApproved: true });
    res.json({ success: true, message: "Comment approved successfully" })
  } catch (error) {
    res.json({ success: false, message: error.message })
  }
}