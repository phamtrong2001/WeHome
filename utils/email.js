const nodemailer = require('nodemailer');

module.exports.sendEmail = function sendEmail(email, password) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            port: '587',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const mailOptions = {
            from: "We Home" + '<' + process.env.MAIL_USER + '>',
            to: email,
            subject: 'Reset password WeHome',
            text: "Let's login with this password and change your password",
            html: "<h3>Chúng tôi đã nhận được yêu cầu reset mật khẩu của bạn.</h3><br>" +
                "<p>Hãy đăng nhập bằng mật khẩu dưới đây và đổi lại mật khẩu của bạn tại We Home" +
                // "<a href='https://www.wehomeapp.tk/'>WeHome</a>" + " : </p>" +
                "<br> <text>" + password + "</text>"
        }

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                throw err;
            } else {
                console.log('Message sent: ' + info.response);
            }
        });
    } catch (err) {
        console.log(err);
    }
}
