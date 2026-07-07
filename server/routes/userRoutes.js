import express from "express";
import {
  signup,
  login,
  getUserProfile,
} from "../controllers/userController.js";

import auth from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);

userRouter.post("/login", login);

userRouter.get("/profile", auth, getUserProfile);

export default userRouter;