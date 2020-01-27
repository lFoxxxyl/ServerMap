const express = require('express')
const userRouter = require('./routes/user_route')
const friendsRouter = require('./routes/friends_route')

var bodyParser = require('body-parser')

const port = process.env.PORT
require('./db/db')

const app = express()
app.use(bodyParser.urlencoded({extended: true}));
//app.use(bodyParser.json());

app.use(express.json())
app.use(userRouter)
app.use(friendsRouter)

app.listen(port, "192.168.1.36", () => {
    console.log(`Server running on port ${port}`)

})

