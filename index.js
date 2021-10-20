const express = require('express')
const bodyParser = require("body-parser")
const cors = require("cors")
const fileUpload = require("express-fileupload");
const app = express()

const fs = require('fs-extra')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors())
app.use(express.static('doctors'))
app.use(fileUpload());
require('dotenv').config();
const port = 5000



const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uqgfx.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentCollection = client.db("doctor's_portal").collection("appointment");
  const doctorsCollection = client.db("doctor's_portal").collection("doctors");

  app.post('/appointment',(req,res)=>{
      const appointment = req.body;
      appointmentCollection.insertOne(appointment)
      .then(result=>{
          console.log(result)
          res.send(result.acknowledged === true)
      })
  })
  app.post("/appointmentsByDate",(req,res)=>{
    const date = req.body;
    const email = req.body.email;

    doctorsCollection.find({email: email})
    .toArray((err,doctors)=>{
      const filter =  {date: date.date}
        if(doctors.length === 0){
            filter.email = email;
        }
            appointmentCollection.find(filter)
            .toArray((err,documents)=>{
            res.send(documents)
        })
    }) 
})

    app.post('/addADoctor',(req,res)=>{
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;

        console.log(file,name,email)

        // const filePath = `${__dirname}/doctors/${file.name}`;

        // file.mv( filePath, err => {
        //     if(err){
        //         console.log(err);
        //         return res.status(500).send({msg: 'failed to upload Image'});
        //     }

            const newImage = file.data;
            const encImg = newImage.toString('base64');

            var image = {
                contentType: file.mimetype,
                size: file.size,
                img: Buffer.from(encImg, 'base64')
            };

            doctorsCollection.insertOne({name, email, image})
            .then(result => {

                // fs.remove(filePath , error=>{
                //     if(error){ console.log(error) }
                    res.send(result.insertedCount > 0 )
                
               // })

            })
            // return res.send({name: file.name , path: `/${file.name}`})
       // })
        
    })


    app.post('/isDoctor',(req,res)=>{
    
        const email = req.body.email;
    
        doctorsCollection.find({email: email})
        .toArray((err,doctors)=>{
                 res.send(doctors.length > 0)
           
        }) 
    })

});


app.listen(process.env.PORT || port)