require('dotenv').config();
const http = require('http');
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")
const csv = require("csvtojson");
const fs = require('fs-extra');

const accountSid = process.env.TWILIO_ACCOUNT_SID; //PUT TWILIO CREDENTIALS HERE
const authToken = process.env.TWILIO_AUTH_TOKEN; //PUT TWILIO CREDENTIALS HERE
const client = require('twilio')(accountSid, authToken);
const mongostring = "mongodb+srv://" + process.env.LEADDBUSER + ":" + process.env.LEADDBPASS + "@nicksrealfriends.oumiz.mongodb.net/leaddb"
mongoose.connect(mongostring)


var messageLog = new mongoose.Schema({
  _id: false,
  messageSender: String,
  chatmessage: String
})
var conversation = new mongoose.Schema({
  _id: false,
  index: Number,
  messageLogKey: [messageLog]
})
var leadSchema = new mongoose.Schema({
  _id: false,
  name: String,
  phonenumber: String,
  conversationKey: [conversation]
});

var Lead = mongoose.model('Lead', leadSchema);

var multer = require('multer')
var upload = multer({
  dest: 'uploads/'
})

const app = express();
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

const MessagingResponse =
  require("twilio").twiml.MessagingResponse;

app.post("/", upload.single('myfile'), function(req, res, next) {
  console.log(req.body);
  console.log("Break");
  console.log(req.file);
  console.log(req.body.message);
  const csvFilePath = req.file.path;
  console.log("CSV file path: " + csvFilePath);

  const realJsonArray = {}
  const jsonArray = csv()
    .fromFile(csvFilePath)
    .then((jsonObj) => {
      for (i = 0; i < jsonObj.length; i++) {
        var i_phone_number = jsonObj[i].phone_number;
        var i_name = jsonObj[i].names;
        var dummyDocument = new Lead({
          name: i_name,
          phonenumber: i_phone_number,
          conversationKey: [{}]
        })
        console.log("Dummydoc: " + dummyDocument)
        Lead.findOneAndUpdate({
            name: i_name
          },
          dummyDocument, {
            upsert: true,
            new: true,
            runValidators: true
          }, // options
          function(err, doc) { // callback
            if (err) {
              // handle error
            } else {
              // handle document
              console.log("Excel to mongodb successful")
            }
          }

        );
        //dummyDocument.save()
        console.log("Mongo doc insert ran successfully")

      }

    })
  //console.log("json array: " + jsonObj);
  //fs.removeSync(csvFilePath);
  fs.remove(csvFilePath)
    .then(() => {
      console.log('Delete success!')
    })
    .catch(err => {
      console.error(err)
    })
  // Async / await usage
  //const jsonArray=await csv().fromFile(csvFilePath);
  //console.log("json array: " + jsonArray)

  res.redirect("/")



  //make sure that excel sheet is in the correct format, which is an excel sheet of rows? instead lookup file?
  //if it's in xlsx, convert it to csv
  //for each line,
  //make sure line is in correct format. if it's not, print a message saying it's not.
  //send the message.
  //get req.body.
});

app.use(session({
  secret: 'anything-you-want-but-keep-secret',
  resave: true,
  saveUninitialized: true
}));

app.post('/storeinmongo', (req, res) => {
  console.log("Chat message: ")
  console.log(req.body.chatmessage)

  var dummyDocument = new Lead({
    name: "Nasty NIck",
    phonenumber: "69420",
    conversationKey: [{}]
  })
  dummyDocument.save()
  var dummyDocument = new Lead({
    name: "Nasty Nickle",
    phonenumber: "6942069",
    conversationKey: [{}]
  })
  dummyDocument.save()


});

function SendMessage(fromPhoneNumber, recipientPhoneNumber, message) {
  console.log("SendMessage");
  client.messages
    .create({
      body: message,
      from: fromPhoneNumber, //PUT TWILIO PHONE NUMBER HERE
      to: recipientPhoneNumber //PUT NASTY NICKS PHONE NUMBER HERE
    })
    .then(message => console.log(message.sid));
}

app.post('/sms', (req, res) => {
  const smsCount = req.session.counter || 0;

  if (smsCount == 0) {
    req.body.message
  }
  let message = 'Hello, thankz for the new message!';

  if (smsCount > 0) {
    message = 'Hello, thanks for message number ' + (smsCount + 1);
  }

  req.session.counter = smsCount + 1;

  const twiml = new MessagingResponse();
  twiml.message(message);

  res.writeHead(200, {
    'Content-Type': 'text/xml'
  });
  res.end(twiml.toString());
});

app.get("/", function(req, res)
{
  res.sendFile(__dirname + "/Login_v3/index.html")
});

app.get("/chatejs", function(req, res)
{
  Lead.find({},function(err,leadCollection){
    console.log(leadCollection);
    res.render("html/chatroom",{leadCollection:leadCollection});
  });

});

app.get("/sms", function(req, res) {
  res.sendFile(__dirname + "/sms/index.html")
});

http.createServer(app).listen(3000, () => {
  console.log('Express server listening on port 3000');
});
