import express from "express";
import { allUsers, createUser, deleteUser, getUser, loginUser, otpVerify, updateUser } from "../controllers/user";
import { getSessionInfo, validateToken } from "../middlewares/auth";

const userRouter = express.Router();

userRouter.post("/login", loginUser)

userRouter.post("/signup", createUser);

userRouter.get("/otpVerification/:otp/:mobile", otpVerify)

userRouter.put("/updateUser", validateToken, getSessionInfo, updateUser);

userRouter.delete("/deleteUser/:id", validateToken, getSessionInfo, deleteUser);

userRouter.get("/:id", validateToken, getSessionInfo, getUser);

userRouter.get("/", validateToken, getSessionInfo, allUsers);



export { userRouter }; 