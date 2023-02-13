import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const { user, otp } = new PrismaClient();

const unirest = require('unirest');
import CryptoJS from "crypto-js";
import * as dotenv from "dotenv";
dotenv.config();
import { generateOTP } from "../utils/otp";
import { sendOtp } from "../services/authService";
import { getAccessToken } from "./jwt";
import { createUserInput } from "../models/domain";



const loginUser = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            res.status(401).send({ error: "Authentication failed..!!" });
        }

        const checkUser = await user.findFirst({
            where: { mobile },
        });

        if (!checkUser) {
            throw new Error("No records found with this number!");
        }
        else {
            const otpString = generateOTP().toString();

            await sendOtp(mobile, otpString);

            let sendResponse = unirest('POST',
                `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=${process.env.sms_gateway_key}&senderid=DRMSRD&channel=OTP&DCS=0&flashsms=0&number=91${mobile}&text=Hello,${otpString} is OTP for registering on Dreamsredeveloped. Please do not share this OTP. Thanks!&route=1`)
                .headers({
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': 'PHPSESSID=61vmra84rl52hhk099p4fpl156'
                })
                .send(`template=1207162377088337176`)
                .end(function (sendResponse: any) {
                    if (sendResponse.error) throw new Error(sendResponse.error);
                    return sendResponse.raw_body;
                });

            return res.send({ message: "OTP sent successfully!" });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error });
    }
};


const otpVerify = async (req: Request, res: Response) => {
    try {
        const receivedOtp = req.params.otp;
        const mobile = Number(req.params.mobile);
        const maxOtpValidityMinutes = 10; // 10 minutes

        const storedOtp = await otp.findFirst({
            where: {
                mobile,
                otp: receivedOtp
            },
        });

        if (!storedOtp) {
            // res.status(400).send("Otp is not valid!")
            throw new Error("Otp is not valid!")
        }
        else {

            const otpTimestamp = storedOtp.createdAt;
            const currentTime = new Date();
            const timeDifference = (currentTime.getTime() - otpTimestamp.getTime()) / 1000 / 60; // difference in minutes
            // console.log('otpTimestamp', otpTimestamp);
            // console.log('currentTime', currentTime);
            // console.log('timediff', timeDifference);
            
            if (timeDifference > maxOtpValidityMinutes) {
                res.status(400).send("Otp has expired! Please request a new one.");
            } else {

                console.log("LOGIN SUCCESS");

                await otp.update({
                    where: { id: storedOtp.id },
                    data: { verified: true },
                });

                let accessToken = await getAccessToken({ mobile });

                // console.log('aaaaaaaaaa', accessToken);

                res.send({
                    message: "User logged in successfully",
                    accessToken
                });
            }
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error });
    }
}



const createUser = async (req: Request, res: Response) => {
    try {
        const {
            first_name,
            last_name,
            email,
            mobile,
            password
        }: createUserInput = req.body;

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
        res.status(400).send({ message: error });
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
        res.status(400).send("Updation failed!!");
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
        res.status(400).send({ message: "User not exists", error });
    }
};


const allUsers = async (req: Request, res: Response) => {
    try {
        // const sessionObj = (req as any).sessionObj;
        // console.log('sessionnnnnn in api allusers', sessionObj);

        const users = await user.findMany({
            select: {
                first_name: true,
                last_name: true,
                mobile: true
            },
        });
        // console.log(users);
        res.send({ users });

    } catch (error) {
        console.log(error);
        res.status(400).send({ message: error });
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
        res.status(400).send({ message: error });
    }
};



export {
    allUsers,
    loginUser,
    otpVerify,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    user
};
