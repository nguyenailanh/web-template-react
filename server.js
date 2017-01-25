//____________________________________________
//                              REQUIRE MODULE
const express = require('express');
const config = require('./config.js');
const bodyParser = require('body-parser');



//____________________________________________
//                             SERVER VARIABLE
let app = express();
let router = express.Router();



//____________________________________________
//                                SETUP SERVER
app.use(express.static('public'));
app.use(router);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));



//____________________________________________
//                              SERVER REQUEST
app.get('*', function(request, response, next) {
  response.sendFile(`${__dirname}/${config.paths.dest}404.html`);
});

app.post(/\/data\/.+/ig, function (req, res) {
  res.redirect(req.url);
});




//____________________________________________
//                                    USE PORT
const logPort = `----- Server listen at ${config.portServer} -----`;
app.listen(config.portServer, () => console.log(logPort));