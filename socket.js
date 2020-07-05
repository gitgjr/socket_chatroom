$(function(){
    var socket = io();
    var uname = null;//login name
    $('.login-btn').click(function(){
        uname = $.trim($('#loginName').val());
        if(uname){
            socket.emit('login',{username:uname})
        }else{
            alert('please input nickname')
        }
    });



    socket.on('loginSuccess',function(data){
        if(data.username === uname){
            checkin(data)
        }else{
            alert('user not match')
        }
    });

    socket.on('loginFail',function(){
        alert('same nick name')
    });

    socket.on('add',function(data){
        var html = '<p>system message:  '+data.username+' joined the chat</p>';
        $('.chat-con').append(html);
        showname();
    });

    function checkin(data){
        $('.login-wrap').hide('slow');
        $('.chat-wrap').show('slow');
    }
    // leave
    socket.on('leave',function(name){
        if(name != null){
            var html = '<p>system message:'+name+'has leave</p>';
            $('.chat-con').append(html);
        }
    })
    function showname()
    {
        $('.name-box').html("<h3>"+"online username:"+uname+"</h3>");
    }


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

})