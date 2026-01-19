//

import nodemailer from "nodemailer";
import "dotenv/config";

export const sendOTPMail = async (otp, email) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailConfigurations = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "pass reset",

    // This would be the text of email body
    html:`<p>your otttppppp</p>`${otp};
  };

transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) throw Error(error);
    console.log("otp Sent Successfully");
    console.log(info);
  });
};
