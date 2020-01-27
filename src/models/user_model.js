const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    login: {
        type: String,
        index: true,
        unique: true,
        required: true,
        trim: true,
        ref:"friends"
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    password: {
        type: String,
        required: true
    },
    latitude:{
        type: Number
    },
    longitude:{
        type: Number
    },
    refreshToken: {
        type: String,
        //required: true
    }
})


const User = mongoose.model('User', userSchema)


module.exports = User
