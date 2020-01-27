const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user_model')
const jwt = require('jsonwebtoken')


async function GetUser (login){
    
    const data =  await User.findOne({login: login});
    return data
}

async function FindLogin (login){
    
    const data =  await User.findOne({login: login});  
    if(data)
        return true;
    return false
}

async function FindEmail (email){
    
    const data =  await User.findOne({email: email});  
    if(data)
        return true;
    return false
}

async function CreateUser(login, email, password)
{
    const foundLogin = await FindLogin(login);
    if (foundLogin)
        return 1;
    const foundEmail = await FindEmail(email);
    if (foundEmail)
        return 2;
    if (password.length<6)
        return 3;
    const hashedPassword = await bcrypt.hash(password, 8)
    await User.create({
        login: login,
        email:email,
        password: hashedPassword
    })
    return 0;
}

async function SetLocation (id, latitude, longitude)
{
    const data = await User.updateOne({_id: id}, {latitude: latitude, longitude: longitude})
    console.log(data)
    if (data.nModified==1)
        return 0;
    return 1;
}

module.exports = {GetUser, FindEmail, FindLogin, CreateUser, SetLocation}