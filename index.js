const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


// middeleware
app.use(cors());
app.use(express.json());
// middeleware







const uri = 'mongodb+srv://geniseCarDBUser:52Qhnp0aKJgQAMef@cluster0.j7rvpzy.mongodb.net/?retryWrites=true&w=majority';

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, '1e8eaa381f263909d024e83ec6ead17e722414a0b97f178f46b0a810b9f3ac2f509628656b781a378d34676db58c2da9f77d2841ee2da9a626c0f28e4b8a01a6', function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    });



}


async function run() {
    try {
        const servicesCollection = client.db('geniusCar').collection('services');
        const orderCollection = client.db('geniusCar').collection('orders');

        // JWT 
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '23h' })
            res.send({ token })
        })




        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            res.send(services)

        });

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service)
        })

        // orders api 
        app.get('/orders', verifyJWT, async (req, res) => {

            const decoded = req.decoded;
            console.log('inside', decoded);
            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }


            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            };
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders)
        });



        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result)
        });

        // edit methode
        app.patch('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: status
                }
            }
            const result = await orderCollection.updateOne(query, updateDoc);
            res.send(result);

        })

        // delete methode
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }

}

run().catch(er => console.error(er));








app.get('/', (req, res) => {
    res.send('Hello genise car server is running')
})
app.listen(port, () => {
    console.log(`Listening to port ${port}`);
})


