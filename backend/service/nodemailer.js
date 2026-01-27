const nodemailer =require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port:587,
    secure:false, //false for all port except port 457
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
    
});

const sendMail = async (to, subject, html) =>{
    try {
        const info = await transporter.sendMail({
            from:`${process.env.EMAIL_USER}`,
            to,
            subject, 
           html,
        });
        console.log("Email sent:" , info);
        return info;
    } catch (error) {
        console.error("error sending email: ", error);
    }
}
module.exports ={sendMail};