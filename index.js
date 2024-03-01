const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xbkhg1t.mongodb.net/z2i_db?retryWrites=true&w=majority`;
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
        const usersCollection = client.db("ZtoI").collection("users");
        const internCollection = client.db("ZtoI").collection("allInterns");
        const userProfile = client.db("ZtoI").collection("userProfile"); 
        const applyCollection = client.db("ZtoI").collection("applyCollection");


        //Users----------------------------------------------------------------
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5h' })
            res.send({ token })
        })

        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ error: true, message: 'forbidden message' });
            }
            next();
        }


        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        app.get('/email', async (req, res) => {
            let query = {};

            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = usersCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }

            const result = await usersCollection.insertOne(user);
            res.send(result);
        });


        // add and get interns ------------------------------------------------------------------------------
        app.post('/interns', async (req, res) => {
            const review = req.body;
            const c = await internCollection.insertOne(review);
            res.send(c);
        });
        app.get('/interns', async (req, res) => {
            let query = {};
            const cursor = internCollection.find(query).limit(0).sort({ $natural: -1 });
            const a = await cursor.toArray();
            res.send(a);
        });
        app.get('/internLimit', async (req, res) => {
            let query = {};
            const cursor = internCollection.find(query).limit(3).sort({ $natural: -1 });
            const serve = await cursor.toArray();
            res.send(serve);
        });
        app.get('/interns/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const b = await internCollection.findOne(query);
            res.send(b);
        });

        //intern query by adminEmail
        app.get('/adminEmail', async (req, res) => {
            let query = {};

            if (req.query.adminEmail) {
                query = {
                    adminEmail: req.query.adminEmail
                }
            }
            const cursor = internCollection.find(query).sort({ $natural: -1 });
            const review = await cursor.toArray();
            res.send(review);
        });

        app.delete('/internDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await internCollection.deleteOne(query);
            res.send(result);
        });
//
        app.get('/apply/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const b = await internCollection.findOne(query);
            res.send(b);
        });
//

        //userProfile
        app.post('/userProfile', async (req, res) => {
            const user = req.body;
            const result = await userProfile.insertOne(user);
            res.send(result);
        });
        app.get('/userProfile', async (req, res) => {
            let query = {};
            const cursor = userProfile.find(query);
            const a = await cursor.toArray();
            res.send(a);
        });
        app.get('/userProfileEmail', async (req, res) => {
            let query = {};

            if (req.query.applicantUserEmail) {
                query = {
                    applicantUserEmail: req.query.applicantUserEmail
                }
            }
            const cursor = userProfile.find(query);
            const review = await cursor.toArray();
            res.send(review);
        });

        app.delete('/userProfileDelete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await userProfile.deleteOne(query);
            res.send(result);
        });


        //Applied in appplyCollection
        app.post('/apply', async (req, res) => {
            const user = req.body;
            const result = await applyCollection.insertOne(user);
            res.send(result);
        });
        app.get('/apply', async (req, res) => {
            let query = {};
            const cursor = applyCollection.find(query);
            const a = await cursor.toArray();
            res.send(a);
        });

        app.get('/applyUserEmail', async (req, res) => {
            let query = {};

            if (req.query.applicantUserEmail) {
                query = {
                    applicantUserEmail: req.query.applicantUserEmail
                }
            }
            const cursor = applyCollection.find(query).sort({ $natural: -1 });
            const review = await cursor.toArray();
            res.send(review);
        });

        app.get('/comEmail', async (req, res) => {
            let query = {};

            if (req.query.adminEmail) {
                query = {
                    adminEmail: req.query.adminEmail
                }
            }
            const cursor = applyCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        });

        app.get('/jobId', async (req, res) => {
            let query = {};

            if (req.query.jId) {
                query = {
                    jId: req.query.jId
                }
            }
            const cursor = applyCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        });


        //
        app.get('/applicant/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const b = await applyCollection.findOne(query);
            res.send(b);
        });




    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('z2i')
})

app.listen(port, () => {
    console.log(`z2i on port ${port}`)
})