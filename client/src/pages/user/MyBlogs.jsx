import React, { useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import toast from "react-hot-toast";
import Moment from "moment";

const MyBlogs = () => {
  const { axios, navigate } = useAppContext();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBlogs = async () => {
    try {
      const { data } = await axios.get("/api/blog/myblogs");
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    const confirm = window.confirm("Are you sure you want to delete this blog?");
    if (!confirm) return;

    try {
      const { data } = await axios.post("/api/blog/delete", { id: blogId });
      if (data.success) {
        toast.success(data.message);
        fetchMyBlogs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleTogglePublish = async (blogId) => {
    try {
      const { data } = await axios.post("/api/blog/toggle-publish", { id: blogId });
      if (data.success) {
        toast.success(data.message);
        fetchMyBlogs();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen mx-5 sm:mx-16 xl:mx-24 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-700">My Blogs</h1>
          <button
            onClick={() => navigate("/addblog")}
            className="bg-primary text-white text-sm px-5 py-2 rounded-full hover:bg-primary/90 transition-all cursor-pointer"
          >
            + Add Blog
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center mt-20">Loading...</p>
        ) : blogs.length === 0 ? (
          <div className="text-center mt-20 text-gray-500">
            <p className="text-lg">You haven't written any blogs yet.</p>
            <button
              onClick={() => navigate("/addblog")}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-full text-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              Write your first blog
            </button>
          </div>
        ) : (
          <div className="relative overflow-x-auto shadow rounded-lg bg-white">
            <table className="w-full text-sm text-gray-500">
              <thead className="text-xs text-gray-600 text-left uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3 max-sm:hidden">Date</th>
                  <th className="px-4 py-3 max-sm:hidden">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog, index) => (
                  <tr key={blog._id} className="border-y border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 max-w-xs truncate font-medium text-gray-700">
                      {blog.title}
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      {Moment(blog.createdAt).format("MMM Do YYYY")}
                    </td>
                    <td className="px-4 py-3 max-sm:hidden">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          blog.isPublished
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {blog.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Edit */}
                        <button
                          onClick={() => navigate(`/blog/edit/${blog._id}`)}
                          className="text-xs border border-primary text-primary px-3 py-1 rounded hover:bg-primary hover:text-white transition-all cursor-pointer"
                        >
                          Edit
                        </button>

                        {/* Publish / Unpublish */}
                        <button
                          onClick={() => handleTogglePublish(blog._id)}
                          className="text-xs border border-gray-400 text-gray-600 px-3 py-1 rounded hover:bg-gray-100 transition-all cursor-pointer"
                        >
                          {blog.isPublished ? "Unpublish" : "Publish"}
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="text-xs border border-red-400 text-red-500 px-3 py-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MyBlogs;
