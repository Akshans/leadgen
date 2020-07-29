const http = require('http');
const express = require("express");
const bodyParser = require("body-parser");

const accountSid = process.env.TWILIO_ACCOUNT_SID; //PUT TWILIO CREDENTIALS HERE
const authToken = process.env.TWILIO_AUTH_TOKEN;  //PUT TWILIO CREDENTIALS HERE
const client = require('twilio')(accountSid, authToken);

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

  //make sure that excel sheet is in the correct format, which is an excel sheet of rows? instead lookup file?
  //if it's in xlsx, convert it to csv
  //for each line,
        //make sure line is in correct format. if it's not, print a message saying it's not.
        //send the message.
  //get req.body.
  console.log(req.body.message);
  client.messages
    .create({
        body: req.body.message,
        from: '+15863156741', //PUT TWILIO PHONE NUMBER HERE
        to: '+12483038027'   //PUT NASTY NICKS PHONE NUMBER HERE
      })
    .then(message => console.log(message.sid));
});

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();

  const message = twiml.message();
  message.body('The Robots are coming! Head for the hills!');

  console.log("found")

  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

app.get("/", function(req, res)
{
  res.sendFile(__dirname + "/index.html")
});

app.get("/sms", function(req, res)
{
  res.sendFile(__dirname + "/sms/index.xml")
});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});