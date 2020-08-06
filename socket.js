//client
$(function(){
    var socket = io();
    var uname ;//login name
    var password ;
    var roomId ;//roomId

    //login
    $('.login-btn').click(function(){
        uname = $.trim($('#loginName').val());
        password = $.trim($('#password').val());
        if(uname){
            //showname();
            socket.emit('login',{id:uname,password:password});
            //alert("get successed");
        }else{
            alert('please input your id')
        }
    });
    socket.on('same_id',function(){
        alert('This ID has already logged in. Your can join another chat');
        checkin1();
    })
    socket.on('loginSuccess',function(){
        alert("welcome "+uname);
        checkin1();
        $('.logout-wrap').show('slow');
    });

    socket.on('loginFail',function(){
        alert('your id or password is wrong')
    });

    //sign up
    $('.go-signup').click(function (){
        $('.login-wrap').hide('slow');
        $('.signup-wrap').show('slow');
    })
    $('.signup-btn').click(function(){
        uname = $.trim($('#new_loginName').val());
        password = $.trim($('#new_password').val());
        if(uname){
            socket.emit('signup',{id:uname,password:password});
        }else{
            alert('please input your id')
        }
    });
    socket.on('signupFail',function(){
        alert('This ID has been registered')
    })
    socket.on('signupSuccess',function(){
        alert('sign up success');
        $('.signup-wrap').hide('slow');
        $('.room-wrap').show('slow');
        showname();
    })
    //logout
    $('.logout-btn').click(function(){
        socket.emit('disconnect',{id:uname});
    })
    //add
    socket.on('add',function(data){
        var html = '<p>system message:  '+data.id+' joined the chat</p>';
        $('.chat-con').append(html);
        //showname();
    });

    function checkin1(){
        $('.login-wrap').hide('slow');
        $('.room-wrap').show('slow');
        showname();
    }
    //room system
    //join room
    $('.room-btn').click(function(){
        roomId = $.trim($('#roomId').val());
        if(roomId){
            socket.emit('join room',{roomId:roomId,id:uname})
        }else{
            alert('please input roomId')
        }
    });
    socket.on('joinFail',function(){
        alert('no such room id')
    })
    socket.on('joinSuccess',function (data){
        alert('you joined '+data.roomId);
        roomId=data.roomId;
        $()
        $('.room-name').html("<h3>"+"room id:"+roomId+"</h3>")
        $('.room-wrap').hide('slow');
        $('.chat-wrap').show('slow');
        $('.quit').show('slow');
    })
    //pc
    $('.pc-btn').click(function (){
        var targetId;
        targetId = $.trim($('#targetId').val());
        if(targetId){
            socket.emit('join pc',{targetId:targetId,id:uname})
        }else{
            alert('please input roomId')
        }
    })
    socket.on('inviteFail',function(){
        alert('no such user or he is outline')
    })
    //create room
    $('.create-btn').click(function(){
        socket.emit('create-room');
    });
    socket.on('create_success',function(data){
        alert('created Successfully room id is'+data.roomId);
        socket.emit('join room',{roomId:data.roomId,username:uname})
    });
    //
    

    // leave
    $('.quit-btn').click(function(){
        //alert('click')
        $('.room-wrap').show('slow');
        $('.chat-wrap').hide('slow');
        socket.emit('leave-room',{roomId:roomId,id:uname});
    });
    socket.on('leave',function(name){
        if(name != null){
            var html = '<p>system message:'+name+'has leave</p>';
            $('.chat-con').append(html);
        }
    })
    function showname()
    {
        $('.name-box').html("<h3>"+"your id:"+uname+"</h3>");
    }

    //message
    $('.sendBtn').click(function(){
        sendMessage()
    });
    $(document).keydown(function(event){
        if(event.keyCode == 13){
            sendMessage()
        }
    })
    function sendMessage(){
        var txt = $('#sendtxt').val();
        $('.sendtxt').val('');
        if(txt){
            socket.emit('sendMessage',{username:uname,message:txt});
        }
        var html
        html ='yourself said: '+txt+'<br>';
        $('.chat-con').append(html);
    }

    socket.on('receiveMessage',function(data){
        showMessage(data)
    });
    
    // show message
    function showMessage(data){
        var html
        if(data.username === uname){
        }else{
            html=data.username+' said: '+data.message+'<br>';
        }
        $('.chat-con').append(html);
    }

    //entering
    var state=0;
    $('#sendtxt').keydown(function(){
        state=1;
        socket.emit('sendTyping',{username:uname,state:state})
        //$('.typing-box').show("slow");
    })
    $('#sendtxt').change(function(){
        //$('.typing-box').hide("slow");
        state=0;
        socket.emit('sendTyping',{username:uname,state:state})
    })
    socket.on('receiveTyping',function(data){
        if(data.state==1){
            $('.typing-box').show('slow').html(data.username+' is typing');
        };
        if(data.state==0){
            $('.typing-box').hide('slow');
        }
    })
    // show list
    $('.show-btn').click(function(){
        socket.emit('show-list');
        $('.live_list').html(' ');
    })
    socket.on('onlineid',function(data){
        $('.live_list').append('<p>'+data.id+' online</p>');
    })
    socket.on('offlineid',function(data){
        $('.live_list').append('<p>'+data.id+' offline</p>');
    })

})