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

async function run(){
    try{
        const categoriesCollection = client.db('zCar').collection('category');
        const carCollection = client.db('zCar').collection('carCollection'); 
        const electricCar = client.db('zCar').collection('electricCar'); 
        // api to get categories data
        app.get('/category', async(req, res) => {
            const query = {};
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories);
        
        })

        // app.get('/category/:id', async(req, res)=>{
        //     const query = {};
        //     const cars = await carCollection.find(query).toArray();
        //     res.send(cars);

        // })


        
        //api to get dynamically carcollection data
        app.get('/category/:id', async(req, res)=>{
            const query = {};
            const cars = await carCollection.find(query).toArray();
            const id = req.params.id;
            const category_cars = cars.filter(n=> n.category_id === id);
            res.send(category_cars);

        })
   




    }
    finally{

    }
}

run().catch((err) => console.log(err));



app.get('/', async (req, res) => {
    res.send('zCar server is running')
})

app.listen(port, () => console.log(`zCar is running on port : ${port}`))
