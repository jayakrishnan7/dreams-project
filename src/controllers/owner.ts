import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const { owner } = new PrismaClient();


import * as dotenv from "dotenv";
import { createOwnerInput } from "../models/domain";
dotenv.config();


const createOwner = async (req: Request, res: Response) => {
    try {
        
        const {
            name,
            image,
            dob,
            sex,
            email
        }: createOwnerInput = req.body;

      
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error });
    }
}

export { createOwner };