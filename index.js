const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {

  const authHeader = req.headers.authorization;
  if (!authHeader) {
      return res.status(401).send('unauthorized access');
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
      if (err) {
          return res.status(403).send({ message: 'forbidden access' })
      }
      req.decoded = decoded;
      next();
  })

}


const run = async () => {
  try {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qxzlll3.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverApi: ServerApiVersion.v1,
    });

    const carsCollection = client.db("fastResale").collection("allCars");
    //                                                                             .updateMany(
    //                                                                              {currentDate:true},
    //                                                                              {$set: {
    //                                                                                  curentDate: new Date()
    //                                                                             }}
    //                                                                              )

    const bookingsCollection = client.db("fastResale").collection("bookings");
    const usersCollection = client.db("fastResale").collection("users");

    app.get("/allCars", async (req, res) => {
      // const selectedCarName = req.body.carName;
      const query = {};
      const result = await carsCollection.find(query).toArray();
      // const bookingQuery = {selectedCarName:carName}
      // console.log(bookingQuery);
      res.send(result);
    });
    app.get("/allCars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cars = await carsCollection.findOne(query);
      res.send(cars);
    });

    app.get('/bookings', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
          return res.status(403).send({ message: 'forbidden access' });
      }

      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
  });
    //POST
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
    
      const query = {
        carName: booking.carName,
        email: booking.email,
      };
      const alreadyBooked = await bookingsCollection.find(query).toArray();

      if (alreadyBooked.length) {
        const message = `You Already have a Booked ${booking.carName}`;
        return res.send({ acknowledged: false, message });
      }

      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });
    //JWT
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "7d",
        });
        return res.send({ accessToken: token });
      }
  
      res.status(403).send({ accessToken: "" });
    });

    //Users
    app.post("/users", async (req, res) => {
      const user = req.body;

      const result = await usersCollection.insertOne(user);
      res.send(result);
    });
  } finally {
  }
};
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Fast Reseal server is running");
});

app.listen(port, () => {
  console.log(`Fast Reseal server running on ${port}`);
});
