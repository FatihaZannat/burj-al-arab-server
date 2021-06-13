const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
var admin = require('firebase-admin');
require('dotenv').config()
const port = 4000

const app = express()
app.use(bodyParser.json())
app.use(cors())





const serviceAccount = require("./hotel-nice-firebase-adminsdk-k5woz-40c1557816.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v7dau.mongodb.net/burj-al-arab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const booking = client.db("burj-al-arab").collection("booking");
  // perform actions on the collection object
  // console.log('db connection successfully')
  
  app.post('/addBooking', (req,res)=>{
      const newBooking = req.body
      booking.insertOne(newBooking)
      .then(result => {
         res.send(result.insertedCount > 0)
      })
      
  })

  app.get('/booking' , (req,res) => {
    // console.log(req.headers.authorization);
    const bearer = req.headers.authorization
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1]
      // console.log({idToken})

      admin.auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const tokenEmail = decodedToken.email;
        const quiryEmail = req.query.email;
        console.log({tokenEmail}, {quiryEmail});
        if(tokenEmail === quiryEmail){
          booking.find({email: quiryEmail})
             .toArray((err, document) => {
              res.status(200).send(document)
          })
        }
        else{
            res.status(401).send('unauthorized access')
        }
       
      })
      .catch((error) => {
  // Handle error
    });
    }
     else{
       res.status(401).send('unauthorized access')
     }
  })
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})