import React, { useEffect, useRef, useState } from "react";
import { assets, blogCategories } from "../../assets/assets";
import Quill from "quill";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import { parse } from "marked";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const AddBlog = () => {
  const { axios, navigate } = useAppContext();

  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Startup");
  const [isPublished, setIsPublished] = useState(false);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // Initialise Quill editor once on mount
  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
    }
  }, []);

  // AI content generation using the blog title as prompt
  const generateContent = async () => {
    if (!title) return toast.error("Please enter a title first");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/blog/generate", { prompt: title });
      if (data.success) {
        quillRef.current.root.innerHTML = parse(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setIsAdding(true);

      const blog = {
        title,
        subTitle: subtitle,
        description: quillRef.current.root.innerHTML,
        category,
        isPublished,
      };

      const formData = new FormData();
      formData.append("blog", JSON.stringify(blog));
      formData.append("image", image);

      const { data } = await axios.post("/api/blog/add", formData);

      if (data.success) {
        toast.success(data.message);
        navigate("/myblogs");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-blue-50/50 py-10 px-4">
        <form
          onSubmit={onSubmitHandler}
          className="bg-white w-full max-w-3xl mx-auto p-6 md:p-10 shadow rounded text-gray-600"
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Write a New Blog</h2>

          {/* Thumbnail */}
          <p>Upload Thumbnail</p>
          <label htmlFor="user-image" className="cursor-pointer">
            <img
              src={!image ? assets.upload_area : URL.createObjectURL(image)}
              alt="thumbnail"
              className="mt-2 h-16 rounded cursor-pointer"
            />
            <input
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="user-image"
              hidden
              required
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

          {/* Description — Quill editor */}
          <p className="mt-4">Blog Description</p>
          <div className="max-w-lg h-74 pb-16 sm:pb-10 pt-2 relative">
            <div ref={editorRef}></div>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 mt-2">
                <div className="w-8 h-8 rounded-full border-2 border-t-white animate-spin"></div>
              </div>
            )}
            <button
              disabled={loading}
              type="button"
              onClick={generateContent}
              className="absolute bottom-1 right-2 text-xs text-white bg-black/70 px-4 py-1.5 rounded hover:underline cursor-pointer"
            >
              Generate with AI
            </button>
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
            <p>Publish Now</p>
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
              disabled={isAdding}
              type="submit"
              className="w-40 h-10 bg-primary text-white rounded cursor-pointer text-sm hover:bg-primary/90 transition-all"
            >
              {isAdding ? "Publishing..." : "Add Blog"}
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

export default AddBlog;
