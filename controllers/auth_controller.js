//! IMPORTING DB CONFIG FILE
const { account_sid, auth_token, service_sid } = require('../service/config')

//! importing schema and packages 
const AuthSchema = require('../models/auth_schema')
const { genSaltSync, hashSync, compareSync } = require('bcrypt');

//! TWILIO configs
const { Twilio } = require('twilio');
const client = new Twilio(account_sid, auth_token);

exports.getAll = (req, res, next) => {
    AuthSchema.find().then((result) => {
        res.status(200).json({ results: result, success: result.length > 0 ? true : false });
    }).catch(err => {
        res.status(500).json({ error: err, success: false });
    });
}

exports.getById = (req, res, next) => {
    const id = req.params.id;
    AuthSchema.findById(id).then((result) => {
        res.status(200).json({ result: result, success: true });
    }).catch(err => {
        res.status(404).json({ error: 'No such user found', success: false });
    });
}



//! SEND OTP FUNCTION
async function sendOtp(body) {

    let result = await client.verify.services(service_sid).verifications
        .create({
            to: body.phoneNumber,
            channel: "sms"
        })

    if (result.status === "pending") {
        return true;
    } else {
        return false;
    }
}

//! REGISTER USER 
exports.register = async(req, res, next) => {


    //! CHECKING IF EMAIL EXISTS OR NOT
    let emailExists = await AuthSchema.findOne({ email: req.body.email });
    if (emailExists === null) {

        //! CHECKING IF PHONE NUMBER EXISTS OR NOT
        let phoneExists = await AuthSchema.findOne({ phoneNumber: req.body.phoneNumber });
        if (phoneExists === null) {

            //! SEND OTP AND CREATE ACCOUNT WHEN OTP VERIFIED
            const status = sendOtp(req.body)
            if (status) {
                res.status(200).json({
                    message: "OTP sent"
                });
            } else {
                res.status(500).json({
                    message: "An error occurred sending OTP"
                });
            }

        } else {
            res.status(400).json({ error: "An account is already linked with this number", success: false });
        }

    } else {
        res.status(400).json({ error: "Email already exists", success: false });
    }

}


//! VERIFY OTP AND CREATE ACCOUNT
exports.verifyOtp = (req, res, next) => {
    const salt = genSaltSync(10);
    req.body.password = hashSync(req.body.password, salt);
    client.verify.services(service_sid).verificationChecks
        .create({
            to: req.body.phoneNumber,
            code: req.body.code,
        }).then(result => {
            if (result.status === "approved") {
                //! CREATING ACCOUNT 
                const authBody = new AuthSchema(req.body);
                authBody.save().then((result) => {
                    res.status(200).json({ message: "Account registered successfully", userId: result._id, success: true });
                }).catch(err => {
                    res.status(500).json({ error: err, success: false });
                });
            } else {
                res.status(500).json({ error: "Invalid OTP", success: false });
            }

        }).catch(err => {
            res.status(500).json({ error: err, success: false });
        })
}



//! LOGIN USER
exports.login = async(req, res, next) => {

    const { email, password, fcmToken } = req.body;
    let auth = await AuthSchema.findOne({ email: email });

    if (auth !== null) {
        const validPassword = compareSync(password, auth.password);
        if (validPassword) {

            auth.updateOne({ fcmToken: fcmToken }, ).then().then((result) => {
                auth.fcmToken = fcmToken;
                res.status(200).json(auth);
            }).catch(err => {
                res.status(200).json(auth);
                console.log(err)
            })

        } else {
            res.status(404).json({ error: "Invalid email or password", success: false });
        }
    } else {
        res.status(404).json({ error: "Invalid email or password", success: false });
    }

}

//! RESEND OTP AND CREATE ACCOUNT
exports.resendOtp = (req, res, next) => {

    //! RESEND SEND OTP 
    const status = sendOtp(req.body)
    if (status) {
        res.status(200).json({
            message: "OTP sent"
        });
    } else {
        res.status(500).json({
            message: "An error occurred sending OTP"
        });
    }
}


exports.updateById = (req, res, next) => {
    const id = req.params.id;

    AuthSchema.findByIdAndUpdate(id, req.body).then((result) => {
        res.status(200).json({ message: "Profile Updated Successfully", success: true });
    }).catch(err => {
        res.status(404).json({ error: err, success: false });
    });



}

// exports.updateAddressById = (req, res, next) => {
//     const id = req.params.id;

//     AuthSchema.findByIdAndUpdate(id, req.body).then((result) => {
//         res.status(200).json({ message: "Updated Successfully", success: true });
//     }).catch(err => {
//         res.status(404).json({ error: err, success: false });
//     });

// }

exports.deleteById = (req, res, next) => {
    const id = req.params.id;
    AuthSchema.findByIdAndDelete(id, req.body).then((result) => {
        res.status(200).json({ message: "Deleted Successfully", success: true });
    }).catch(err => {
        res.status(404).json({ error: err, success: false });
    });

}