const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());


const run = async()=>{

    try{

        
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxzlll3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


    const carsCollection = client.db('fastResale').collection('allCars')
//                                                                             .updateMany(
//                                                                              {currentDate:9},
//                                                                              {$set: {
//                                                                                  curentDate: new Date()
//                                                                             }}
//                                                                              )

 
    

    app.get('/allCars', async(req,res)=>{
        const query = {};
        const result = await carsCollection.find(query).toArray()
        console.log(result);
        res.send(result)
    })
    app.get('/allCars/:id',async(req,res)=>{
       const id = req.params.id;
       const query = {_id: ObjectId(id)}
       const cars = await carsCollection.findOne(query)
       res.send(cars)
    })
    // app.put('/allCars/:id',async(req,res)=>{
    //    const id = req.params.id;
    //    const filter = {_id: ObjectId(id)}
    //    const options = {upsert:true}
    //    const updateDoc = {
    //     $currentDate:{ post:true }
    //    }
    //    const cars = await carsCollection.findOne(filter, updateDoc,options)
    //    res.send(cars)
    // })





    }
    finally{

    }





}
run().catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Fast Reseal server is running')
})

app.listen(port, () => {
    console.log(`Fast Reseal server running on ${port}`);
})