const express = require('express');
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000
// dealer app 
const app = express()
// middlewares 
app.use(cors())
app.use(express.json())


// connect mongo db 
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const db = client.db('HH_CommerzeDB')

// users collection 
    const usersCollection = db.collection('users')
   
    // get users collection 
    app.get('/users', async(req,res)=>{
     const result = await usersCollection.find().toArray()
     res.send(result)
    })
    
    
    // route for register new user
    app.post('/users',async(req,res)=>{
      const userData = req.body;
      const email = userData?.email;
      const filter={email : email}
      const userExist = await usersCollection.find(email).toArray()
      if(userExist){
        return res.send('user  already exist')
      }
      const result =await usersCollection.insertOne(userData)
      res.send(result)
      
      
    })

  } finally {
    
  }
}
run().catch(console.dir);




// basic route 
app.get('/',(req,res)=>{
  res.send("HH commerze is running")
})

app.listen(port,()=>{
  console.log('port',port);
})