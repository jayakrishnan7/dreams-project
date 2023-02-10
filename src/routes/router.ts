import express from "express";
import { allUsers, createUser, deleteUser, getUser, loginUser, otpVerify, updateUser } from "../controllers";
import { getSessionInfo, validateToken } from "../middlewares/auth";

const router = express.Router();

router.post("/signup", createUser);

router.post("/login", loginUser)

router.get("/otpVerification/:otp", otpVerify)

router.put("/updateUser", validateToken, getSessionInfo, updateUser);

router.delete("/deleteUser/:id", validateToken, getSessionInfo, deleteUser);

router.get("/:id", validateToken, getSessionInfo, getUser);

router.get("/", validateToken, getSessionInfo, allUsers);



export { router }; 