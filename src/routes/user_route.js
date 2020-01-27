const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user_model')
const UserFunctions = require('../functions/user_functions')
const jwt = require('jsonwebtoken')
const Friends = require('../models/friends_model')

const auth = require('../middleware/auth')

const router = express.Router()

router.post('/user/create',  async(req, res) =>{
    // Create a new user
        if (!req.body.login||!req.body.email||!req.body.password)
            return res.status(400).send({error: "Bad request "})
        const user = new User(req.body);
        const data = await UserFunctions.CreateUser(req.body.login,req.body.email,req.body.password)
        if (data==0)
                res.status(201).send({ user });
        if (data==1)
                res.status(422).send({error: `Login ${req.body.login} already exists`});
        if (data==2)
                res.status(422).send({error: `Email ${req.body.email} already exists`});
        if (data==3)
            res.status(422).send({error: `Password is short`});
        else
            res.status(500);
        
})

router.post('/user/login', async(req, res) => {
    //Login a registered user
    const { login, password } = req.body
    const user = await UserFunctions.GetUser(login)
    if(!user)
         return res.status(403).send({ error: 'Wrong login or password' });
         
    const hash = await bcrypt.compare(password, user.password);
    if(!hash)
        return res.status(403).json({error: `Wrong login or password`});
    const accessToken = await GenerateAccessToken(user._id,user.login);
    const refreshToken = await GenerateRefreshToken(user._id,user.login);
    const setToken = await SetRefreshToken(user._id, refreshToken)
    res.send({accessToken: accessToken, refreshToken: refreshToken})
    //console.log(a)
    /*try {
        const { login, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }*/
})

router.post('/user/refreshToken', async(req, res) => {
    const receivedToken = req.body.refreshToken;
    console.log(receivedToken)
    try{
        const token = await jwt.verify(receivedToken, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_LIFE})
        const currentToken = await GetRefreshToken (token._id);

        if ((!currentToken)||receivedToken!=currentToken)
            return res.status(401).send({ error: 'Not authorized to access this resource' })
        const newAccessToken = await GenerateAccessToken(token._id,token.login);
        const newRefreshToken = await GenerateRefreshToken(token._id,token.login);
        const setToken = await SetRefreshToken(token._id, newRefreshToken)
        res.send({accessToken: newAccessToken, refreshToken: newRefreshToken})
    }
    catch{
        return res.status(401).send({ error: 'Not authorized to access this resource' })
    }
})

router.get('/user/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.data)
})

router.get('/user/search',auth, async(req, res) => {
    //console.log(req)
    const login = req.query.login;

    const friends = await Friends.find({$or: [{login1:req.data.login}, {login2:req.data.login}]})

    let friendsLogins = new Array();

    for (let i = 0; i<friends.length;i++){
        if (friends[i].login1==req.data.login)
            friendsLogins.push(friends[i].login2)
        else 
            friendsLogins.push(friends[i].login1)
        
    }
    friendsLogins.push(req.data.login)

    const data = await User.find({$and: [{login: {'$regex': login, '$options': 'i'}},{login: {$nin: friendsLogins}}]},{login:1, _id:0})
    // View logged in user profile
    console.log(data)
    res.send(data)
})

router.get('/user/logout', auth, async (req, res) => {
    // Log user out of the application
    try {
        console.log(req.data._id)
        await SetRefreshToken (req.data._id, null)
        res.status(200).send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/user/location/set', auth, async (req, res) => {

    const {latitude, longitude} = req.body
    if (!latitude||!longitude)
        return res.status(400).send({error: "Bad request "})
    const setLocation = await UserFunctions.SetLocation(req.data._id, latitude, longitude)


    return res.send();
})

router.get('/user/location/get', auth, async (req, res) => {

    const logins = req.query.logins;

    const friends = await Friends.find({$or: [{login1:req.data.login,login2:{$in: logins}, accept: true}, {login1:{$in: logins}, login2:req.data.login, accept: true}]})

    let friendsLogins = new Array();

    for (let i = 0; i<friends.length;i++){
        if (friends[i].login1==req.data.login)
            friendsLogins.push(friends[i].login2)
        else 
            friendsLogins.push(friends[i].login1)
    }

    const data = await User.find({login: {$in: friendsLogins}},{login:1,latitude:1, longitude:1 , _id:0})
    console.log(data)

    return res.send(data)
})



async function GetRefreshToken (id)
{
    const data = await User.findOne({_id: id})
    return data.refreshToken;
}


async function SetRefreshToken (id, token)
{
    const data = await User.updateOne({_id: id}, {refreshToken: token}) 
    console.log(data)
    if (data.nModified==1)
        return 0;
    return 1;
}

async function GenerateAccessToken(id, login)
{
    const token = await jwt.sign({_id: id, login:login}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.ACCESS_TOKEN_LIFE})
    return token
}
async function GenerateRefreshToken(id, login)
{
    const token = await jwt.sign({_id: id, login:login}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: process.env.REFRESH_TOKEN_LIFE})
    return token
}




module.exports = router 