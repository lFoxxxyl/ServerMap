const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user_model')
const Friends = require('../models/friends_model')
const jwt = require('jsonwebtoken')
const UserFunctions = require('../functions/user_functions')

const auth = require('../middleware/auth')

const router = express.Router()

router.post('/friends/request',auth,  async(req, res) =>{

    if (req.data.login==req.body.login2||!req.body.login2)
        return res.status(400).send({error: `Bad request`})

    const createFriend = await CreateFriend(req.data.login, req.body.login2)
    if (createFriend == 1)
        return res.status(404).send({error: `User ${req.body.login2} not found`})
    if (createFriend == 2)
        return res.status(422).send({error: `Request already sent to user ${req.body.login2}`})
    if (createFriend == 3)
        return res.status(422).send({error: `User ${req.body.login2} already sent request`})
    if (createFriend == 0)
        return res.status(201).send();
    else
        return res.status(500).send() 
})

router.post('/friends/accept',auth,  async(req, res) =>{
    const accept = req.body.accept
    const friend = await GetFriend(req.body.login1,req.data.login )
    console.log(friend)

    if (!friend)
    {
        return res.status(422).send({error: `User ${req.body.login1} not sent request`})
    }
    console.log(req.body.accept)

    if (req.body.accept==true){
        console.log(req.data.login)

        await Friends.updateOne({login1:req.body.login1, login2:req.data.login}, {accept: accept})

    }
    if (req.body.accept==false)
        await Friends.deleteOne({login1:req.body.login1, login2:req.data.login})
    res.send()
})

router.get('/friends/get',auth,  async(req, res) =>{

    const friends = await Friends.find({$or: [{login1:req.data.login, accept: true}, {login2:req.data.login, accept: true}]})

    let friendsLogins = new Array();

    for (let i = 0; i<friends.length;i++){
        if (friends[i].login1==req.data.login)
            friendsLogins.push(friends[i].login2)
        else 
            friendsLogins.push(friends[i].login1)
        
    }

    res.send(friendsLogins)
})

router.get('/friends/requests/get',auth,  async(req, res) =>{

    const friends = await Friends.find( {login2:req.data.login, accept: null},{login1:1, _id:0})

    res.send(friends)
})


async function CreateFriend(login1, login2){
    const user = await UserFunctions.GetUser(login2)
    if (!user)
        return 1;
    const friend1 = await GetFriend(login1, login2)
    if (friend1)
        return 2;
    const friend2 = await GetFriend(login2, login1)
    if (friend2)
        return 3;

    await Friends.create({
        login1: login1,
        login2: login2,
        accept: null
        });
    return 0;
}



async function GetFriend(login1, login2){
    const data = await Friends.findOne({login1: login1, login2: login2})
    if (data)
        return data;
    return false;
}



module.exports = router