const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bbiovs6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const tutorCollection = client.db("tutorBooking").collection("tutors");
    const bookCollection = client.db("tutorBooking").collection("bookRecord");

    app.get("/findTutor", async (req, res) => {
      const query = {};
      const result = await tutorCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/tutor/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };

      const result = await tutorCollection.findOne(query);
      res.send(result);
    });

    app.post("/addTutorials", async (req, res) => {
      const tutorialsData = req.body;
      const result = await tutorCollection.insertOne(tutorialsData);

      res.send(result);
    });
    app.post("/bookTutorials", async (req, res) => {
      const bookData = req.body;
      console.log(bookData);
      const result = await bookCollection.insertOne(bookData);

      res.send(result);
    });

    app.get("/bookedTutorials", async (req, res) => {
      const query = {};
      const result = await bookCollection.find(query).toArray();
      res.send(result);
    });

    // app.patch("/tutor/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const { review } = req.body;
    //   // console.log(id);
    //   const query = { _id: new ObjectId(id) };
    //   const options = { upsert: true };
    //   const updateDoc = {
    //     $inc: {
    //       review: 1,
    //     },
    //   };
    //   const result = await tutorCollection.updateOne(query, updateDoc, options);
    //   console.log(result);

    //   res.send(result);
    // });

    app.get("/tutorr/:ema", async (req, res) => {
      const email = req.params.ema;
      
      const query = {
        email: email,
      };

      const result = await tutorCollection.find(query).toArray();
      res.send(result);
    });

    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
