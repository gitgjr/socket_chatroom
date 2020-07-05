var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = [];
var rooms = [];
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
app.get('/socket.js',(req,res) =>{
    res.sendFile(__dirname + '/socket.js');
});

io.on('connection', function (socket) {
    var isNewPerson = true; 
    var username = null;
    socket.on('login',function(data){
        for(var i=0;i<users.length;i++){
            if(users[i].username === data.username){
                isNewPerson = false
                break;
            }else{
                isNewPerson = true
            }
        }
        if(isNewPerson){
            username = data.username
            users.push({
              username:data.username
            })
            socket.emit('loginSuccess',data)
            //io.sockets.emit('add',data)
        }else{
            socket.emit('loginFail','')
        }  
    })
    // logout
    socket.on('disconnect',function(){
        io.sockets.emit('leave',username)
        users.map(function(val,index){
            if(val.username === username){
                users.splice(index,1);
            }
        })
     });
     //join room
     socket.on('join room',function(data){
        socket.join(data.roomId);
        socket.roomId = data.roomId;
        io.to(socket.roomId).emit('add',data);
     });
     //message
    socket.on('sendMessage',function(data){
        io.to(socket.roomId).emit('receiveMessage',data)
    });
    //typing
    socket.on('sendTyping',function(data){
        io.to(socket.roomId).emit('receiveTyping',data)
    })
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});