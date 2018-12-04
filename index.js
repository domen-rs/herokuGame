var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var players={};
io.on('connection', function(socket){
  console.log("a user connected");
  players[socket.id]={
    rotation:0,
    x:Math.floor(Math.random()*700)+50,
    y:Math.floor(Math.random()*500)+50,
    playerId:socket.id
  }
  socket.emit("currentPlayers",players);
  socket.broadcast.emit("newPlayer",players[socket.id]);
  socket.on("playerMovement",function(movementData){
    //console.log("ok move");
    players[socket.id].x=movementData.x;
    players[socket.id].y=movementData.y;
    socket.broadcast.emit("playerMoved",players[socket.id]);
  })
  socket.on("disconnect",function(){
    console.log("user disconnected");
    delete players[socket.id];
    io.emit("disconnect",socket.id);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
