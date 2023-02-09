import express from "express";
import { allUsers, createUser, deleteUser, getUser, loginUser, otpVerify, updateUser } from "../controllers";

const router = express.Router();

router.post("/signup", createUser);

router.put("/updateUser", updateUser);

router.delete("/deleteUser/:id", deleteUser);

router.get("/:id", getUser);

router.post("/login", loginUser)

router.get("/otpVerification/:otp", otpVerify)

router.get("/", allUsers);



export { router }; 