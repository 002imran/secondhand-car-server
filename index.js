const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');

require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6xivgke.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



app.get('/', async (req, res) => {
    res.send('zCar server is running')
})

app.listen(port, () => console.log(`zCar is running on port : ${port}`))
