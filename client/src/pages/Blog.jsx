import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { assets } from "../assets/assets";
import Navbar from "../components/Navbar";
import Moment from "moment"
import Footer from '../components/Footer'
import Loader from "../components/Loader";
import toast from "react-hot-toast";
import { useAppContext } from "../context/AppContext";


const Blog = () => {
  const { id } = useParams();
  const { axios, token, user, navigate } = useAppContext();

  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');

  const fetchBlogData = async () => {
    try {
      const { data } = await axios.get(`/api/blog/${id}`)
      data.success ? setData(data.blog) : toast.error(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await axios.post('api/blog/comments', { blogId: id })
      if (data.success) {
        setComments(data.comments)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  // Comment submission — auth required, name auto-filled from logged-in user
  const addComment = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login to comment');
      navigate('/login');
      return;
    }
    try {
      const { data } = await axios.post('api/blog/add-comment', {
        blog: id,
        name: user?.name || 'Anonymous',
        content,
      });
      if (data.success) {
        toast.success(data.message);
        setContent('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchBlogData();
    fetchComments();
  }, []);

  return data ? (
    <div className="relative">
      <img
        src={assets.gradientBackground}
        alt=""
        className="absolute -top-50 -z-1 opacity-50"
      />
      <Navbar />

      <div className="text-center mt-20  text-gray-600">
        <p className="text-primary py-4 font-medium">
          Published on {Moment(data.createdAt).format("MMMM Do YYYY")}
        </p>
        <h1 className="text-2xl sm:text-5xl font-semibold max-w-2xl mx-auto text-gray-800">
          {data.title}
        </h1>
        <h2 className="my-5 max-w-lg truncate mx-auto">{data.subTitle}</h2>
        <p
          className="inline-block py-1 px-4 rounded-full mb-6 border text-sm
border-primary/35 bg-primary/5 font-medium text-primary"
        >
          {data.author?.name || 'Swami Anand'}{" "}
        </p>
      </div>

      <div className="mx-5 max-w-5xl md:mx-auto my-10 mt-6">
        <img src={data.image} alt="" className="rounded-3xl mb-5" />

        <div
          className="rich-text max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: data.description }}
        ></div>

        {/* Comments list */}
        <div className="mt-14 mb-10 max-w-3xl mx-auto">
          <p className="font-semibold mb-4">comments ({comments.length})</p>
          <div className="flex flex-col gap-4">
            {comments.map((item, index) => (
              <div
                key={index}
                className="relative bg-primary/2 border border-primary/5 max-w-xl p-4 rounded text-gray-600"
              >
                <div className=" flex item-center gap-2 mb-2">
                  <img src={assets.user_icon} alt="" className="w-6" />
                  <p className="font-medium">{item.name}</p>
                </div>
                <p className="text-sm max-w-md ml-8">{item.content}</p>
                <div
                  className="absolute right-4 bottom-3 flex items-center gap-2 text-xs" >
                  {Moment(item.createdAt).fromNow()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add comment section — only visible to logged-in users */}
        <div className="max-w-3xl mx-auto">
          <p className="font-semibold mb-4">Add your Comment</p>

          {token ? (
            // User is logged in — show comment form
            <form onSubmit={addComment} className="flex flex-col items-start gap-4 max-w-lg">
              {/* Name auto-filled, read-only */}
              <input
                type="text"
                value={user?.name || ''}
                readOnly
                className="w-full p-2 border border-gray-300 rounded outline-none bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <textarea
                onChange={(e) => setContent(e.target.value)}
                value={content}
                className="w-full p-2 border border-gray-300 rounded outline-none h-48"
                placeholder="Write your comment..."
                required
              ></textarea>
              <button
                className="bg-primary text-white rounded p-2 px-8 hover:scale-102 transition-all cursor-pointer"
                type="submit"
              >
                Submit
              </button>
            </form>
          ) : (
            // Guest — show login prompt
            <div className="max-w-lg p-4 border border-primary/20 rounded bg-primary/5 text-center">
              <p className="text-gray-600 mb-3">Login to leave a comment</p>
              <button
                onClick={() => navigate('/login')}
                className="bg-primary text-white px-6 py-2 rounded-full text-sm hover:bg-primary/90 transition-all cursor-pointer"
              >
                Login
              </button>
            </div>
          )}
        </div>

        {/* Share buttons */}
        <div className="my-24 max-w-3xl mx-auto">
          <p className="font-semibold my-4">Share this article on social media</p>
          <div className="flex">
            <img src={assets.facebook_icon} width={50} alt="" />
            <img src={assets.twitter_icon} width={50} alt="" />
            <img src={assets.googleplus_icon} width={50} alt="" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  ) : (
    <Loader />
  );
};

export default Blog;
