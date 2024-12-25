const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials:  true
}));
app.use(express.json());
app.use(cookieParser());


const verifyToken=(req, res, next)=>{
    const token = req.cookies?.token

    if (!token) {
        return res.status(401).send({message: "Unauthorize Access"})
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=>{
        if (err) {
            return res.status(401).send({message: "Unauthorize Access"})
        }

        req.user = decoded

        next()
    })

}

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

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "5h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
        })
        .send({ success: true });
    });

    app.post('/logout', (req, res)=>{
        res.clearCookie('token', {
            httpOnly: true,
            secure: false
        })
        .send({success: true})
    })

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
        const email = req.query.loggedInUserEmail;
      const query = {
        loggedInUserEmail: email
      };
      

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

    app.get("/tutorr",verifyToken, async (req, res) => {
      const email = req.query.email;
      console.log(email);

      const query = {
        email: email,
      };
      console.log(req.cookies?.token);
      console.log(req.user.email);
      if (req.user.email !== req.query.email) {
        return res.status(403).send({message: 'forbidden'})
      }

      const result = await tutorCollection.find(query).toArray();
      res.send(result);
    });

    app.delete("/tutorials/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };

      const result = await tutorCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/updateTutorials/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };

      const result = await tutorCollection.findOne(query);
      // console.log(result);
      res.send(result);
    });

    app.put("/updateTutorial/:id", async (req, res) => {
      const id = req.params.id;
      //   console.log(id);
      const data = req.body;
      console.log(data);
      const options = { upsert: true };

      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          email: data.email,
          name: data.name,
          photo: data.photo,
          language: data.language,
          price: data.price,
          description: data.description,
          review: data.review,
        },
      };

      const result = await tutorCollection.updateOne(query, updateDoc, options);
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
