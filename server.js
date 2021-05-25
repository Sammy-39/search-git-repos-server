const express = require('express')
const cors = require('cors')
require('dotenv').config()

const ConnectDb = require("./db/connectDb")
const {notFound, errorHandler} = require("./middlewares/errorHandler")

ConnectDb()

const app = express()

app.use(cors({ origin: 'https://search-git-repos.netlify.app'}))
app.use(express.static('public'))

// routes
const reposRouter = require('./routes/repos')

app.use('/api',reposRouter)

// error handlers
app.use(notFound)
app.use(errorHandler)


const port = process.env.PORT || 5000

app.listen(port, ()=>{
    console.log("Server is running on http://localhost:"+port)
})