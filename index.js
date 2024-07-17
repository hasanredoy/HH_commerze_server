const express = require('express');
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
let bcrypt = require('bcryptjs');
let salt = bcrypt.genSaltSync(10);

const port = process.env.PORT || 5000
// dealer app 
const app = express()
// middlewares 
app.use(cors())
app.use(express.json())


// connect mongo db 
const uri = process.env.MONGO_URI;
// console.log(uri);
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
    await client.connect();
   
    const db = client.db('HH_CommerzeDB')

// users collection 
    const usersCollection = db.collection('users')
   
    // get users collection 
    app.get('/users', async(req,res)=>{
     const result = await usersCollection.find().toArray()
     res.send(result)
    })
    // // get user role
    // app.get('/users/:email', async(req,res)=>{
    //   const email = req.params.email
    //  const result = await usersCollection.findOne({email})
    //  const userStatus = result?.role
     
    //  res.send({role:userStatus})
    // })


    // get users for login  
    app.post('/user_login', async(req,res)=>{
      // get user data 
      const userDataForLogin = req?.body
      const userEmail= userDataForLogin?.email
      const userPhone= userDataForLogin?.phone
      const userPin= userDataForLogin?.pin
      

      // check PIN 
      
      const filter = {$or:[{email:userEmail},{phone:userPhone}]}
      const result = await usersCollection.findOne(filter)
      // match pin 
      console.log('userpin==',userPin,'resutpin==',result?.pin);
      const checkPin = bcrypt.compareSync(userPin, result?result?.pin:'111');
      // get user role
      const role = result?.role
      // make user object to retain while user login
      const user = {
        name:result?.name,
        email:result?.email,
        phone:result?.phone,
        balance: role=="user"?result?.user_balance:result?.agent_balance

      }
      // console.log(result);
      if(!result){
       return res.send({message:'invalid number/email',role})
      }
      if(!checkPin){
       return res.send({message:'incorrect pin',role})
      }
    //  if(checkPin&&result.status=='pending'){
    //  return  res.send({message:'Request Under Process',role})
      
    // }
     if(checkPin&&result.status=='approved'){
       
    }
    return  res.send({message:'user',user,role})
    })
    
    
    // route for register new user
    app.post('/users',async(req,res)=>{
      //receive user data 
      const userData = req.body;
      // hash pin 
      const hashedPin=bcrypt.hashSync(userData.pin, salt);
      // console.log(hashedPin);
      //make new user data
      const newUserData = {
        name: userData?.name,
        email: userData?.email,
        phone: userData?.phone,
        pin: hashedPin,
        user_balance: userData?.user_balance,
        agent_balance: userData?.agent_balance,
        role: userData?.role,
        status: userData?.status
      }
      // console.log({newUserData});

      const email = userData?.email;
      const phone = userData?.phone;
      const filter={email,phone}
      // find user 
      const userExist = await usersCollection.findOne(filter)
      // check user is exist 
      if(userExist){
        // if user exist return
        return res.send('user  already exist')
      }
      // insert user 
      const result =await usersCollection.insertOne(newUserData)
      // send result 
      res.send(result)
      
      
    })

     // Send a ping to confirm a successful connection
     await client.db("admin").command({ ping: 1 });
     console.log("Pinged your deployment. You successfully connected to MongoDB!");
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