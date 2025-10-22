require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.send("Movies Galaxy Server is running!");
});

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xqgbxlh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        const movieCollection = client.db("movieDB").collection("movie");
        const userCollection = client.db("movieDB").collection("users");

        // CREATE - Add new movie
        app.post('/movie', async (req, res) => {
            try {
                const newMovie = req.body;
                const result = await movieCollection.insertOne(newMovie);
                res.status(201).send({ success: true, message: "Movie added successfully", data: result });
            } catch (err) {
                console.error(err);
                res.status(500).send({ success: false, message: "Failed to add movie" });
            }
        });

        // READ - Get all movies
        app.get('/movies', async (req, res) => {
            try {
                const result = await movieCollection.find().toArray();
                res.send(result);
            } catch (err) {
                console.error(err);
                res.status(500).send({ success: false, message: "Failed to fetch movies" });
            }
        });

        // READ - Get single movie by ID
        app.get('/movie/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await movieCollection.findOne(query);
                if (!result) {
                    return res.status(404).send({ success: false, message: "Movie not found" });
                }
                res.send(result);
            } catch (err) {
                console.error(err);
                res.status(500).send({ success: false, message: "Failed to fetch movie" });
            }
        });

        // UPDATE - Update movie by ID
        app.put('/movie/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const updatedMovie = { $set: req.body };
                const result = await movieCollection.updateOne(query, updatedMovie);
                if (result.matchedCount === 0) {
                    return res.status(404).send({ success: false, message: "Movie not found" });
                }
                res.send({ success: true, message: "Movie updated successfully" });
            } catch (err) {
                console.error(err);
                res.status(500).send({ success: false, message: "Failed to update movie" });
            }
        });

        // DELETE - Delete movie by ID
        app.delete('/movie/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await movieCollection.deleteOne(query);
                if (result.deletedCount === 0) {
                    return res.status(404).send({ success: false, message: "Movie not found" });
                }
                res.send({ success: true, message: "Movie deleted successfully" });
            } catch (err) {
                console.error(err);
                res.status(500).send({ success: false, message: "Failed to delete movie" });
            }
        });

        // Users APIs
        app.post('/users', async (req, res) => {
            try {
                const newUser = req.body;
                const result = await userCollection.insertOne(newUser);
                res.send(result);
            } catch (err) {
                console.error(err);
                res.status(500).send({ success: false, message: "Failed to add user" });
            }
        });

        app.get('/users', async (req, res) => {
            try {
                const result = await userCollection.find().toArray();
                res.send(result);
            } catch (err) {
                console.error(err);
                res.status(500).send({ success: false, message: "Failed to fetch users" });
            }
        });

    } catch (error) {
        console.error("Database connection error:", error);
    }
}

run().catch(console.dir);

module.exports = app;
