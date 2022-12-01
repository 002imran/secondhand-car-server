const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6xivgke.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'forbidden access'})
        }
        req.decoded = decoded;
        next();
    })
}

async function run(){
    try{
        const categoriesCollection = client.db('zCar').collection('category');
        const carCollection = client.db('zCar').collection('carCollection'); 
        const electricCar = client.db('zCar').collection('electricCar'); 
        const bookingCollection = client.db('zCar').collection('carBooking');
        const usersCollection = client.db('zCar').collection('users');
        const sellerCollection = client.db('zCar').collection('sellerUsers');


        //verify admin
        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: '' })
            }
            next()
        }

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

        //api for car booking
        app.post('/bookings', async(req, res) =>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })

        // api to get bookings data
        app.get('/bookings', async (req, res) => {
            const query = {};
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings);

        })
        //api to post caradd
        app.post('/addproduct', async(req, res) =>{
            const addProduct = req.body;
            const result = await carCollection.insertOne(addProduct);
            res.send(result);
        })
        
        //api to get my product data
        app.get('/myproduct', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email !== decodedEmail){
                return res.status(403).send({message: 'forbidden access'});
            }
            const query = { email: email};
            const myProduct = await carCollection.find(query).toArray();
            res.send(myProduct);

        })

        //jwt implement
        app.get('/jwt', async(req, res)=>{
            const email = req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1d'})
                return res.send({accessToken: token});
            }
            res.status(403).send({accessToken: ''})
        })

        //api to save users in database
        app.post('/users', async(req, res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        //api to save seller in database
        app.post('/sellerusers', async (req, res) => {
            const user = req.body;
            const result = await sellerCollection.insertOne(user);
            res.send(result);
        })



        //api to check users role admin or not
        app.get('/users/admin/:email', async(req, res)=>{
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
        })


       

        //api to make admin
        app.put('/users/admin/:id', verifyJWT, verifyAdmin, async(req, res) =>{
            
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        //api to get users data
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });

        //specific users delete
        app.delete('/users/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        })

        //api to get sellers data
        app.get('/sellerusers', async (req, res) => {
            const query = {};
            const users = await sellerCollection.find(query).toArray();
            res.send(users);
        });

        
        //api for specific sellers account delete
        app.delete('/sellerusers/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await sellerCollection.deleteOne(filter);
            res.send(result);
        })

        //api for delete orders
        app.delete('/bookings/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await bookingCollection.deleteOne(filter);
            res.send(result);
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
