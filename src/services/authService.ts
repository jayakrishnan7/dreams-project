import { PrismaClient } from "@prisma/client";

const { otp } = new PrismaClient();

export const sendOtp = async (mobile: number, otpString: string): Promise<any> =>{
  
  await otp.create({
    data: {
      mobile: mobile,
      otp: otpString, 
      verified: false,
    },
  });
  
  return true;
}


