const nodemailer = require('nodemailer');
require('dotenv').config();
    
const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;


const mailSender = async(email,title,body) => {
    try{
        let trasporter = nodemailer.createTransport({
            host: SMTP_HOST,
            auth:{
                user: SMTP_USER,
                password: SMTP_PASS
            }
        })

        let info = await trasporter.sendMail({
            from: `"No Reply" <${SMTP_USER}>`,
            to: email,
            subject: title,
            html: body  
        })

    }

    catch(error){
        console.error('Error sending email:', error);
    }
}
module.exports = mailSender;