import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { assets, blogCategories } from "../../assets/assets";
import Quill from "quill";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const EditBlog = () => {
  const { id } = useParams();
  const { axios, navigate } = useAppContext();

  const [isSaving, setIsSaving] = useState(false);
  const [image, setImage] = useState(null);        // new image file (optional)
  const [existingImage, setExistingImage] = useState(""); // current image URL
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Startup");
  const [isPublished, setIsPublished] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // Initialise Quill editor once on mount
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
    }
  }, []);

  // Fetch existing blog data and pre-fill the form
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(`/api/blog/${id}`);
        if (data.success) {
          const blog = data.blog;
          setTitle(blog.title);
          setSubtitle(blog.subTitle || "");
          setCategory(blog.category);
          setIsPublished(blog.isPublished);
          setExistingImage(blog.image);

          // Wait for Quill to be ready before setting content
          setTimeout(() => {
            if (quillRef.current) {
              quillRef.current.root.innerHTML = blog.description;
            }
          }, 100);
        } else {
          toast.error(data.message);
          setFetchError(true);
        }
      } catch (error) {
        toast.error(error.message);
        setFetchError(true);
      }
    };

    fetchBlog();
  }, [id]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      // Send as multipart/form-data to support optional image upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("subTitle", subtitle);
      formData.append("description", quillRef.current.root.innerHTML);
      formData.append("category", category);
      formData.append("isPublished", isPublished);

      // Only attach image if a new one was selected
      if (image) {
        formData.append("image", image);
      }

      const { data } = await axios.put(`/api/blog/update/${id}`, formData);

      if (data.success) {
        toast.success(data.message);
        navigate("/myblogs");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (fetchError) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center text-gray-600">
          <p className="text-lg">Blog not found or you don't have permission to edit it.</p>
          <button
            onClick={() => navigate("/myblogs")}
            className="mt-4 bg-primary text-white px-6 py-2 rounded-full text-sm"
          >
            Back to My Blogs
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-blue-50/50 py-10 px-4">
        <form
          onSubmit={onSubmitHandler}
          className="bg-white w-full max-w-3xl mx-auto p-6 md:p-10 shadow rounded text-gray-600"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Edit Blog</h2>

          {/* Thumbnail — shows existing image, allows replacement */}
          <p>Thumbnail <span className="text-xs text-gray-400">(leave unchanged to keep current)</span></p>
          <label htmlFor="edit-image" className="cursor-pointer">
            <img
              src={image ? URL.createObjectURL(image) : existingImage}
              alt="thumbnail"
              className="mt-2 h-16 rounded cursor-pointer object-cover"
            />
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="edit-image"
              hidden
            />
          </label>

          {/* Title */}
          <p className="mt-4">Blog Title</p>
          <input
            type="text"
            placeholder="Type here"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded"
          />

          {/* Subtitle */}
          <p className="mt-4">Blog Subtitle</p>
          <input
            type="text"
            placeholder="Type here"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full max-w-lg mt-2 p-2 border border-gray-300 outline-none rounded"
          />

          {/* Description — Quill editor pre-filled */}
          <p className="mt-4">Blog Description</p>
          <div className="max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative">
            <div ref={editorRef}></div>
          </div>

          {/* Category */}
          <p className="mt-4">Blog Category</p>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="mt-2 px-3 py-2 border text-gray-500 border-gray-300 outline-none rounded"
          >
            {blogCategories.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>

          {/* Publish toggle */}
          <div className="flex items-center gap-3 mt-4">
            <p>Published</p>
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="scale-125 cursor-pointer"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-4 mt-8">
            <button
              disabled={isSaving}
              type="submit"
              className="w-40 h-10 bg-primary text-white rounded cursor-pointer text-sm hover:bg-primary/90 transition-all"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/myblogs")}
              className="text-sm text-gray-500 underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default EditBlog;
