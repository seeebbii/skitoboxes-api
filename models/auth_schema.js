const mongoose = require('mongoose');
const AuthSchema = mongoose.Schema;
const AddressSchema = mongoose.Schema;


const addressSchema = new AddressSchema({

    name: {
        type: String,
        required: true
    },

    receiverDetails: {
        name: {
            type: String,
            required: true
        },
        number: {
            type: String,
            required: true
        }
    },

    address: {
        houseDetails: {
            type: String,
            required: true
        },
        streetNumber: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        province: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        }
    }

}, { timestamps: true })


const authSchema = new AuthSchema({

    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    fcmToken: {
        type: String,
        required: false,
    },


    address: addressSchema


}, { timestamps: true })





module.exports = mongoose.model('AuthSchema', authSchema);