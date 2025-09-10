const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

// root route
app.get('/', (req, res) => {
    res.send("Hello Developer");
});

// mongodb connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xqgbxlh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        const movieCollection = client.db("movieDB").collection("movie");

        // POST to add new movie
        app.post('/movie', async (req, res) => {
            try {
                const newMovie = req.body;
                const result = await movieCollection.insertOne(newMovie);
                res.status(201).send(result);
            } catch (err) {
                res.status(500).send({ error: "Failed to add movie" });
            }
        });

        // GET to fetch all movies
        app.get('/movies', async (req, res) => {
            const movies = await movieCollection.find().toArray();
            res.send(movies);
        });

        await client.db("admin").command({ ping: 1 });
        console.log(" Connected to MongoDB!");
    } catch (error) {
        console.error(error);
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(` Movies Galaxy Server running on port: ${port}`);
});
