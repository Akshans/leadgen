const express = require("express");
const bodyParser = require("body-parser");

const accountSid = ''; //PUT TWILIO CREDENTIALS HERE
const authToken = '';  //PUT TWILIO CREDENTIALS HERE
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
         from: '+1', //PUT TWILIO PHONE NUMBER HERE
         to: '+1'   //PUT NASTY NICKS PHONE NUMBER HERE
       })
      .then(message => console.log(message.sid));


  /*  const twiml = new MessagingResponse();
    twiml.message(req.body.message);
    res.end(twiml.toString());

    console.log("Message: " + req.body.message)
    res.redirect(__dirname + "/index.html");*/
  });

app.get("/", function(req, res)
{
  res.sendFile(__dirname + "/index.html")
});

app.listen(3000, function(){
  console.log("Server started on port 3000");
})
