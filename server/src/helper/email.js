const nodemailer = require("nodemailer");
const { smtpPassword, smtpUsername } = require("../secret");


const transporter = nodemailer.createTransport({
    host: "mail.bengalbey.com",
    port: 465,
    secure: true,
    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: smtpUsername,
      pass: smtpPassword,
    },
  });

  const emailWithNodeMailer = async(emailData)=>{
  try {
    const mailOptions = {
        from: smtpUsername, // sender address
        to: emailData.email, // list of receivers
        subject: emailData.email, // Subject line
        html: emailData.html, // html body
        
    }
  const info= await transporter.sendMail(mailOptions);
    console.log('message sent', info.response);
  } catch (error) {
 console.error('Error occurred while sending email: ', error);
  throw error;
  }
  }

  module.exports = emailWithNodeMailer;