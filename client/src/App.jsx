import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Public pages
import Home from "./pages/Home";
import Blog from "./pages/Blog";

// Admin pages
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddBlog from "./pages/admin/AddBlog";
import ListBlog from "./pages/admin/ListBlog";
import Comments from "./pages/admin/Comments";
import AdminLogin from "./components/admin/Login";

// User auth pages
import AuthLayout from "./pages/auth/AuthLayout";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// User feature pages
import MyBlogs from "./pages/user/MyBlogs";
import UserAddBlog from "./pages/user/AddBlog";
import EditBlog from "./pages/user/EditBlog";

import "quill/dist/quill.snow.css";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";

const App = () => {
  // token  → user is logged in
  // adminToken → admin is logged in
  const { token, adminToken } = useAppContext();

  return (
    <div>
      <Toaster />
      <Routes>

        {/* ─── Public Routes ─── */}
        <Route path="/" element={<Home />} />
        <Route path="/blog/:id" element={<Blog />} />

        {/* ─── User Auth Routes ───
            Logged-in users are redirected away from login/signup */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/signup"
            element={token ? <Navigate to="/" replace /> : <Signup />}
          />
        </Route>

        {/* ─── User Protected Routes ───
            If not logged in, redirect to /login */}
        <Route
          path="/myblogs"
          element={token ? <MyBlogs /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/addblog"
          element={token ? <UserAddBlog /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/blog/edit/:id"
          element={token ? <EditBlog /> : <Navigate to="/login" replace />}
        />

        {/* ─── Admin Routes ───
            If admin is logged in, show Layout; otherwise show AdminLogin */}
        <Route
          path="/admin"
          element={adminToken ? <Layout /> : <AdminLogin />}
        >
          <Route index element={<Dashboard />} />
          <Route path="addBlog" element={<AddBlog />} />
          <Route path="listBlog" element={<ListBlog />} />
          <Route path="comments" element={<Comments />} />
        </Route>

      </Routes>
    </div>
  );
};

export default App;
