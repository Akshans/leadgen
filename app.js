const express = require("express");
const bodyParser = require("body-parser");

const accountSid = '';
const authToken = '';
const client = require('twilio')(accountSid, authToken);

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

const MessagingResponse =
  require("twilio").twiml.MessagingResponse;

  app.post("/", (req, res) => {
    client.messages
      .create({
         body: req.body.message,
         from: '+1',
         to: '+1'
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
