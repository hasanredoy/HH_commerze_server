const express = require('express');
const cors = require('cors')
require('dotenv').config()

const port = process.env.PORT || 5000
// dealer app 
const app = express()
// middlewares 
app.use(cors())
app.use(express.json())

app.get('/',(req,res)=>{
  res.send("HH commerze is running")
})

app.listen(port,()=>{
  console.log('port',port);
})