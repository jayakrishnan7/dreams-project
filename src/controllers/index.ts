import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const { user } = new PrismaClient();

import CryptoJS from "crypto-js";
import * as dotenv from "dotenv";
dotenv.config();


const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        // console.log('wwwwwwwww', email, password);

        if (email == undefined || password == undefined) {
            res.status(500).send({ error: "Authentication failed..!!" });
        }

        const checkUser = await user.findFirst({
            where: {
                email,
            },
        });

        if (checkUser == null) {
            res.send("No records found!!");
        } else if (checkUser) {
            const dbPassword = checkUser.password;

            // console.log('db hashed password', dbPassword);
            // console.log('postmanSendingPassword', password);

            const keysec = process.env.ENCRYPTION_KEY as string;

            var bytes = CryptoJS.AES.decrypt(dbPassword, keysec);

            var originalText = bytes.toString(CryptoJS.enc.Utf8);

            // console.log('rrrrrrr', originalText);

            if (originalText == password) {
                let accessToken = await getAccessToken({
                    email: email,
                    userId: checkUser!.id,
                });

                // console.log('aaaaaaaaaa', accessToken);

                res.send({
                    userId: checkUser!.id,
                    message: "User logged in successfully",
                    accessToken: accessToken,
                });
            } else {
                console.log("Password authentication failed.");

                res.status(500).send({ error: "Authentication failed!!" });
            }
        } else {
            console.log("Invalid credentials. User not found!!");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};


const createUser = async (req: Request, res: Response) => {
    try {
        type createPersonInput = {
            first_name: string;
            last_name: string;
            email: string;
            mobile: number;
            password: string;
        };
        const {
            first_name,
            last_name,
            email,
            mobile,
            password
        }: createPersonInput = req.body;

        const userExists = await user.findFirst({
            where: { mobile },
        });

        if (userExists) {
            res.status(400).send({ message: "user already exists" });
        } else {

            // password encryption...........................
            let keysec = process.env.ENCRYPTION_KEY as string;

            var ciphertext = CryptoJS.AES.encrypt(password, keysec).toString();

            await user.create({
                data: {
                    first_name,
                    last_name,
                    email,
                    mobile,
                    password: ciphertext,
                    isMobileVerified: false,
                    isDeleted: false
                },
            });

            const createdUser = {
                data: {
                    first_name,
                    last_name,
                    email,
                    mobile,
                },
            };

            res.send({ message: "User created successfully", createdUser });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error });
    }
};


const updateUser = async (req: Request, res: Response) => {
    try {
        const { user_id, first_name, last_name, email } = req.body;

        await user.update({
            where: { user_id },
            data: { first_name, last_name, email },
        });

        res.send({
            message: "Updated successfully..."
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Updation failed!!");
    }
};


const deleteUser = async (req: Request, res: Response) => {
    try {
        const user_id = req.params.id;

        await user.update({
            where: { user_id },
            data: { isDeleted: true }
        });

        res.send({
            message: `Deleted ${user_id} user successfully...`
        });
    } catch (error) {
        res.status(500).send({ message: "User not exists", error });
    }
};


const allUsers = async (req: Request, res: Response) => {
    try {
        const users = await user.findMany({
            select: {
                first_name: true,
                last_name: true,
                mobile: true
            },
        });
        console.log(users);
        res.send({ users });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error });
    }
};


const getUser = async (req: Request, res: Response) => {
    try {
        const user_id = req.params.id;

        const findUser = await user.findFirst({
            where: { user_id }
        });

        const newUser = {
            first_name: findUser?.first_name,
            last_name: findUser?.last_name,
            mobile: findUser?.mobile,
        }

        res.send({ users: newUser });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: error });
    }
};


export {
    allUsers,
    loginUser,
    getUser,
    createUser,
    updateUser,
    deleteUser,
};