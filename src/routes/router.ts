import express from "express";
import { allUsers, createUser, deleteUser, getUser, loginUser, updateUser } from "../controllers";

const router = express.Router();

router.post("/signup", createUser);

router.put("/updateUser", updateUser);

router.delete("/deleteUser/:id", deleteUser);

router.get("/:id", getUser);

router.post("/login", loginUser)

router.get("/", allUsers);



export { router }; 