const jwt = require('jsonwebtoken')
const User = require('../models/user_model')

const auth = async(req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '')
    try{
        const data = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_LIFE})
        req.data = data
        req.token = token
        next()
    }
    catch{
        res.status(401).send({ error: 'Not authorized to access this resource' })
    }
}
module.exports = auth

