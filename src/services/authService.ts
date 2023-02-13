import { PrismaClient } from "@prisma/client";

const { otp } = new PrismaClient();

export const sendOtp = async (mobile: number, otpString: string): Promise<any> => {

  const checkSameNumber = await otp.findFirst({
    where: { mobile }
  })

  if (checkSameNumber) {
    await otp.update({
      where: {
        mobile
      },
      data: {
        otp: otpString,
        createdAt: new Date()
      }
    })
  }
  else { 
    await otp.create({
      data: {
        mobile: mobile,
        otp: otpString,
        verified: false,
      },
    });
  }

  return true;
}


