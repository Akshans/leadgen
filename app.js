require('dotenv').config();
const http = require('http');
const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")

const accountSid = process.env.TWILIO_ACCOUNT_SID; //PUT TWILIO CREDENTIALS HERE
const authToken = process.env.TWILIO_AUTH_TOKEN;  //PUT TWILIO CREDENTIALS HERE
const client = require('twilio')(accountSid, authToken);
const mongostring = "mongodb+srv://" + process.env.LEADDBUSER+ ":"+ process.env.LEADDBPASS + "@nicksrealfriends.oumiz.mongodb.net/leaddb"
mongoose.connect(mongostring)


var messageLog = new mongoose.Schema({
  messageName: String,
  chatmessage: String
})
var conversation = new mongoose.Schema({
  index: Number,
  messageLogKey: [messageLog]
})
var leadSchema = new mongoose.Schema({
  name: String,
  phonenumber: String,
  conversationKey: [conversation]
});

var Lead = mongoose.model('Lead', leadSchema);

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const MessagingResponse =
  require("twilio").twiml.MessagingResponse;

app.post("/",  upload.single('myfile'), function (req, res, next){
  console.log(req.body);
  console.log("Break")
  console.log(req.file);
  console.log(req.body.message);


  //make sure that excel sheet is in the correct format, which is an excel sheet of rows? instead lookup file?
  //if it's in xlsx, convert it to csv
  //for each line,
        //make sure line is in correct format. if it's not, print a message saying it's not.
        //send the message.
  //get req.body.
});

app.use(session({secret: 'anything-you-want-but-keep-secret', resave: true, saveUninitialized: true}));

app.post('/storeinmongo', (req,res) => {
  console.log("Chat message: ")
  console.log(req.body.chatmessage)

  //var dummyDocument = new Lead({name: "Nasty NIck",})


})

function SendMessage(fromPhoneNumber, recipientPhoneNumber, message)
{
  console.log("SendMessage");
  client.messages
    .create({
        body: message,
        from: fromPhoneNumber, //PUT TWILIO PHONE NUMBER HERE
        to: recipientPhoneNumber   //PUT NASTY NICKS PHONE NUMBER HERE
      })
    .then(message => console.log(message.sid));
}

app.post('/sms', (req, res) => {
  const smsCount = req.session.counter || 0;

  if(smsCount == 0)
  {
    req.body.message
  }
  let message = 'Hello, thankz for the new message!';

  if(smsCount > 0) {
    message = 'Hello, thanks for message number ' + (smsCount + 1);
  }

  req.session.counter = smsCount + 1;

  const twiml = new MessagingResponse();
  twiml.message(message);

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.get("/", function(req, res)
{
  res.sendFile(__dirname + "/chatroom.html")
});

app.get("/sms", function(req, res)
{
  res.sendFile(__dirname + "/sms/index.html")
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});
