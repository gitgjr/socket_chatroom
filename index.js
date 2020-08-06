//server
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require("fs");
const { request } = require('http');

//json module
var bodyParser = require("body-parser");
const { emit } = require('process');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
var allowCrossDomain = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');//Customize the middleware and set the response header required by cross domain。
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');  //Any method is allowed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,X-Session-Token');   //Any type is allowed
  next();
};
app.use(allowCrossDomain);
var jsonParser = bodyParser.json();

var users = [];
var rooms = [];
//user class
var user_number=0;
function  User(){
    var id;
    var password;
}
var liveuser = new User();
// room class
function Room(){
    var id;
    var type;
}
var liveroom = new Room();



app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
app.get('/socket.js',(req,res) =>{
    res.sendFile(__dirname + '/socket.js');
});
app.get('/jquery-3.5.1.min.js',(req,res) =>{
    res.sendFile(__dirname + '/jquery-3.5.1.min.js');
});


io.on('connection', function (socket) { 
    var username = null;
    var roomId;
    //login
    socket.on('login',function(data){
        var counter=0;
        liveuser.id=data.id;
        liveuser.password = data.password;
        console.log(liveuser.id);
        for(var i=0;i<users.length;i++){
            if(liveuser.id==users[i]){
                socket.emit('same_id');
            }
        }
        fs.readFile('data/users.json','utf8',function(err,data){
            var jsonData = JSON.parse(data);
            if(err){
                console.log("file read errer");
            }
            for(var i=0;i<jsonData.length;i++){
                if(liveuser.id == jsonData[i].id && liveuser.password == jsonData[i].password){
                    counter=1;
                }     
            }
            if(counter==1){
                    socket.id=liveuser.id;
                    username = liveuser.id;
                    users.push(liveuser.id);
                    socket.emit('loginSuccess',data);
                    //io.sockets.emit('add',data);
            }
            else {socket.emit('loginFail',data); }
        }) 
    })

    //signup
    socket.on('signup',function(data){
        var state = 0;
        liveuser.id=data.id;
        liveuser.password = data.password;
        fs.readFile('data/users.json','utf8',function(err,data){
            var jsonData = JSON.parse(data);
            if(err){
                console.log("file read errer");
            }
            for(var i=0;i<jsonData.length;i++){
                if(liveuser.id == jsonData[i].id){
                    //request('chat.html');
                    socket.emit('signupFail');
                    state = 1;
                }     
            }
            if(state!=1){
                socket.emit('signupSuccess');
                var person = data.toString();
                person = JSON.parse(person);
                person.push(liveuser);
                let str = JSON.stringify(person,"","\t");
                fs.writeFile('data/users.json',str,function(err){
                    if (err) {res.status(500).send('Server is error...')}
                    })
            }
        })
    })
    //
    socket.on('leave-room',function(data){
        socket.leave(data.roomId);
    })
    // logout
    socket.on('disconnect',function(){
        console.log('disconnect');
        io.sockets.emit('leave',username);
        users.map(function(val,index){
            if(val.username === username){
                users.splice(index,1);
            }
        })
    });
    //room
    socket.on('create-room',function(){
        fs.readFile('data/rooms.json','utf8',function(err,data){
            var counter=0;
            var jsonData = JSON.parse(data);
            if(err){
                console.log("file read errer");
            }
            for(var i=0;i<jsonData.length;i++){
                if(jsonData[i].type==2){
                    counter++
                }
            }
            liveroom.id=2000+counter+1;
            liveroom.type=2;
            var room = data.toString();
            room = JSON.parse(room);
            room.push(liveroom);
            let str = JSON.stringify(room,"","\t");
            fs.writeFile('data/rooms.json',str,function(err){
            if (err) {res.status(500).send('Server is error...')}
            })
            socket.emit('create_success',{roomId:liveroom.id});
        })
        //console.log(liveroom)
    })
    socket.on('join room',function(data1){
        fs.readFile('data/rooms.json','utf8',function(err,data){
            var jsonData = JSON.parse(data);
            var counter=0;
            if(err){
                console.log("file read errer");
            }
            for(var i=0;i<jsonData.length;i++){
                if(jsonData[i].id==data1.roomId){
                    counter=1;
                }
            }
            if(counter==1){
                roomId = data1.roomId;
                socket.join(data1.roomId);
                socket.roomId = data1.roomId;
                socket.emit('joinSuccess',data1);
                io.to(socket.roomId).emit('add',data1);
            }
            else{
                socket.emit('joinFail');
            }
        })
    });
    socket.on('join pc',function(data1){
        var counter=0;
        for(var i=0;i<users.length;i++){
            if(data1.targetId==users[i]){
                counter=1;
            }
        }
        // fs.readFile('data/users.json','utf8',function(err,data){
            
        //     if(err){
        //         console.log("file read errer");
        //     }
        //     for(var i=0;i<data.length;i++){
        //         if(data[i].id==data1.targetId){
        //             counter++;
        //         }
        //     }
        //     if(io.sockets.connected[data1.targetId]){
        //         console.log(io.sockets.connected[data.targetId]);
        //         counter++
        //     }
        // })
        //console.log(counter)
        if (counter==1){
            fs.readFile('data/rooms.json','utf8',function(err,data){
                var counter=0;
                var jsonData = JSON.parse(data);
                if(err){
                    console.log("file read errer");
                }
                for(var i=0;i<jsonData.length;i++){
                    if(jsonData[i].type==1){
                        counter++                        }
                    }
                liveroom.id=1000+counter+1;
                liveroom.type=1;
                var room = data.toString();
                room = JSON.parse(room);
                room.push(liveroom);
                let str = JSON.stringify(room,"","\t");                    
                fs.writeFile('data/rooms.json',str,function(err){
                    if (err) {res.status(500).send('Server is error...')}
                })
                socket.emit('create_success',{roomId:liveroom.id});
                io.to(data1.targetId).emit('create_success',{roomId:liveroom.id})
            })

                //socket.emit('inviteSuccess',{f});
        }else{
            socket.emit('inviteFail');
        }
        
    })
    //message
    socket.on('sendMessage',function(data){
        io.sockets.emit('receiveMessage',data)
    });
    //typing
    socket.on('sendTyping',function(data){
        io.sockets.emit('receiveTyping',data)
    })
    //show list
    socket.on('show-list',function(){
        fs.readFile('data/users.json','utf8',function(err,data){
            var jsonData = JSON.parse(data);
            var a=0;
            if(err){
                console.log("file read errer");
            }
            for(var i=0;i<jsonData.length;i++){
                for(var j=0;j<users.length;j++){
                    a=0;
                    if(users[j]==jsonData[i].id){
                        socket.emit('onlineid',{id:jsonData[i].id});
                        a=1;
                    }
                    if(a==0){
                        socket.emit('offlineid',{id:jsonData[i].id})
                    }
                }
                
            }
        })

    })
});



http.listen(3000, function(){
  console.log('listening on *:3000');
});