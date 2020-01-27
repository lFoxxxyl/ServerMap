const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('./user_model')

const friendsSchema = mongoose.Schema({
    login1: {
        type:  String,
        ref: "users",
        required: true,
    },
    login2: {
        type:  String,
        ref: "users",
        required: true,
    },
    accept:{
        type: Boolean,
    }
})

friendsSchema.index({login1: 1, type: -1})
friendsSchema.index({ login2: 1, type: -1})
friendsSchema.index({login1: 1, login2: 1}, {unique: true})

const Friends = mongoose.model('Friends', friendsSchema)


module.exports = Friends