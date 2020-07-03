const nodemailer = require("nodemailer");

const mailConfig = require(__path.config+'/mail');

// define account sender
let account = mailConfig.account;

module.exports = {
    // data{to, subject, text, html}
    send: async function (data){
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: account.user, // generated ethereal user
                pass: account.pass // generated ethereal password
            }
        });

        let info = await transporter.sendMail({
            from: account.user, // sender address
            to: data.to, // list of receivers
            subject: data.subject, // Subject line
            text: data.text, // plain text body
            html: data.html // html body
        });

        console.log("Message sent: %s", info.messageId);
    },

    // data{email, validationCode, pureUrl}
    sendUpdatePassMail(data){
        let link = data.pureUrl+`${displayConf.prefix.auth}/update-new-pass/${data.code}`;
        let mailData = {
            to: data.email,
            subject: 'Update password magazine account',
            html: 'Please follow <a href="'+link+'">this link</a> to update your new password',
        }
        this.send(mailData).catch((err) => {console.log(err);
        })
    },

    // data{email, validationCode, pureUrl}
    sendActivationUserMail(data){
        let link = data.pureUrl+`${displayConf.prefix.auth}/activate/${data.activationCode}`;
        let mailData = {
            to: data.email,
            subject: 'Activation magazine account',
            html: 'Thanks for signing up with mangazine! You must follow <a href="'+link+'">this link</a> to activate your account',
        }
        this.send(mailData).catch((err) => {console.log(err);
        })
    }
};