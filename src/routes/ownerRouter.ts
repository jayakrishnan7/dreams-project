import express from "express";
import { createOwner } from "../controllers/owner";

const ownerRouter = express.Router();


ownerRouter.post("/signup", createOwner);



export { ownerRouter }; 