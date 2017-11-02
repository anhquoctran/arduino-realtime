var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var handlebars = require("express-handlebars");
var mongoose = require('mongoose');
var path = require("path");
var pug = require('pug')
var morgan = require('morgan')
var bodyparser = require("body-parser")

const full_app_name = "Realtime communication with Arduino ESP8266 and NodeJS Socket.IO and Android Native app";
const production_db_server = "mongodb://admin:admin@ds042417.mlab.com:42417/realtime-arduino";
const local_development_db_server = "mongodb://localhost:27017/realtime-arduino";

//Server configuration
app.set("view engine", "pug")
app.set('views', __dirname + '/views')
app.use('/public', express.static(__dirname + '/public'))
app.use(morgan("dev"));
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))

server.listen(3000, function () {
    console.log("Server is runing at port 3000")
})


//Database configuration and setup object schemas
mongoose.connect(local_development_db_server, {useMongoClient: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function() { console.log("Database connected") });

var Schema = mongoose.Schema;
var LightSchema = new Schema({ value: Number, datePuts: Date});
var cardIdSchema = new Schema({ cardId: String, datePuts: Date });

var light = mongoose.model('Light', LightSchema, 'light');
var cardId = mongoose.model('Card', cardIdSchema, 'card');


//Routing to Index html page
app.get('/', function(req, res, next) {
    res.render("index", { title : full_app_name });
});


app.get("/connected", async function(req, res, next) {
    try {
        var listCardId = await light.find({}).exec();
        var listLightValue = await cardId.find({}).limit(5).exec();
        
        res.json({
            values : {
                light: listLightValue || [],
                cards: listCardId || []
            }
        })

    } catch (errors) {
        throw errors;
    }
});

//Handling POST request to add light state value
app.post('/puts/light', function(req, res, next) {
    var body = req.body;
    var data = body.data;
    if(!data) {
        res.status(500).send({
            error: "Requested parameters not valid or null",
            code: 500,
            request: {
                date: Date.now()
            }
        });
    } else {
        if(value) {
            var value = parseInt(data.value);
            var now = Date.now();

            var lightValue = new light({
                value: value,
                datePuts: now
            });
    
            lightValue.save(function(err) {
                if(err) throw err;
                else
                    io.emit("lightValues", value);
            });

        }
        
        
    }
});

app.post('/puts/card', function(req, res, next) {
    var body = req.body;
    var data = body.data;
    if(!data) {
        
    }
});

//Handling socket.io data connection
io.on('connection', function(socket) {

    socket.on('card', function(data) {
        var value = JSON.parse(data);
        var cardid = value.cardid;
        var now = Date.now();

        var cardvalue = new cardId({
            cardId: carid,
            datePuts: now
        });

        cardvalue.save(function(err) {

            if(err) throw err;
            else
            {
                var cardObj = {
                    cardId: cardid,
                    datePuts: now
                }
                var cardStr = JSON.stringify(cardObj);

                io.emit("access", cardObj);
            }
                
        });
    });
});