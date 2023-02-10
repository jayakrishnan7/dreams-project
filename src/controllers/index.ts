import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const { user, otp } = new PrismaClient();

const unirest = require('unirest');
import CryptoJS from "crypto-js";
import * as dotenv from "dotenv";
import { generateOTP } from "../utils/otp";
import { sendOtp } from "../services/authService";
import { getAccessToken } from "./jwt";
dotenv.config();

let otpOfUser = {
    temp: "",
    mobile: ""
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            res.status(500).send({ error: "Authentication failed..!!" });
        }

        const checkUser = await user.findFirst({
            where: { mobile },
        });

        if (!checkUser) {
            res.send("No records found with this number!");
        }
        else {
            const otpString = generateOTP().toString();

            otpOfUser.temp = otpString;
            otpOfUser.mobile = mobile;


            await sendOtp(mobile, otpString);

            let sendResponse = unirest('POST',
                `https://www.smsgatewayhub.com/api/mt/SendSMS?APIKey=${process.env.sms_gateway_key}&senderid=DRMSRD&channel=OTP&DCS=0&flashsms=0&number=91${mobile}&text=Hello,${otpString} is OTP for registering on Dreamsredeveloped. Please do not share this OTP. Thanks!&route=1`)
                .headers({
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Cookie': 'PHPSESSID=61vmra84rl52hhk099p4fpl156'
                })
                // .send(`apiKey=${process.env.sms_gateway_key}`)
                .send(`template=1207162377088337176`)
                // .send(`message=Hello, ${otpString} is OTP for registering on Dreamsredeveloped. Please do not share this OTP. Thanks!`)
                // .send(`numbers=${mobile}`)
                // .send('test=false')
                // .send('sender=DRMSRD')
                .end(function (sendResponse: any) {
                    if (sendResponse.error) throw new Error(sendResponse.error);
                    return sendResponse.raw_body;
                });

            return res.send({ message: "OTP sent successfully!" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
};

const otpVerify = async (req: Request, res: Response) => {
    try {
        const receivedOtp = req.params.otp;
        const mobile = req.body.mobile;

        const storedOtp = await otp.findFirst({
            where: { mobile, otp: receivedOtp },
          });

        if (!storedOtp) {
            res.status(500).send("Otp is not valid!")
        }
        else {
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

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error });
    }
}



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
    otpVerify,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    user
};
