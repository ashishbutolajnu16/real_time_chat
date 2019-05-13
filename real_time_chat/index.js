var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./db.js');
var userObj = require('./users/users.js');
var jobObj = require('./jobs/jobs.js');
var skillObj = require('./skills/skills.js');
var messageObj = require('./messages/messages.js');
var gcm = require('android-gcm');
logger = require('./log');
var apns = require('apn');
var path = require('path');
var errorCallback = function(err, notif) {
  console.log('ERROR : ' + err + '\nNOTIFICATION : ' + notif);
}
//setting options in options
//get changes
//next line added
//adding next line
// nexct commeny
// 7th comment
//testing comment
// testting1 comment
// testing 2 comment
//testing 4 comment
// testing 5 comment
// testing 6 comment
// testing 7 comment
// testing 7 comment
//  this is new commity
// that is new committtt
//coming here
var options = {
  // key: __dirname + '/PushDevCertKey.pem',
  // cert: __dirname + '/PushDevCertKey.pem',
  // key: path.resolve('./keys/EchoLimoDevKey.pem'),// dev mode
  // cert: path.resolve('./keys/EchoLimoDevCert.pem'),
  //key: path.resolve('./keys/key.pem'),
  //cert: path.resolve('./keys/cert.pem'),
  /*live mode*/
  production: false,
  certData: null,
  passphrase: "welcome",
  keyData: null,
  ca: null,
  pfx: null,
  pfxData: null,
  // gateway: "gateway.sandbox.push.apple.com" ,
  //gateway: 'gateway.push.apple.com',
  port: 2195,
  rejectUnauthorized: true,
  enhanced: true,
  errorCallback: errorCallback,
  cacheLength: 100,
  autoAdjustCache: true,
  connectionTimeout: 0,
  // address: "gateway.sandbox.push.apple.com" // for testing purpose
}

options.gateway = "gateway.sandbox.push.apple.com";
options.key = path.resolve('./PushKey.pem');
options.cert = path.resolve('./PushCert.pem');
//console.log( path.resolve('./PushKey.pem')); 
var apnsConnection = new apns.Connection(options);
var note = new apns.Notification();
var gcmObject = new gcm.AndroidGcm('AIzaSyC_5mrHRfwNhN-xHNJ4_tv1hXpsmPbZnss');


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
 var nicknames = [];


 /*var idx = $scope.selection.indexOf(id);
              // is currently selected
              if (idx > -1) {
                $scope.selection.splice(idx, 1);
              }
*/

io.on('connection', function(socket){
  console.log("socket id ",socket.id)
  



  socket.emit('currentuser_socketid', socket.id);

  //Update socket id corresponding to user.
  socket.on('user_socket',function(from)
  {
    console.log("logged in User ",from ," ", socket.id)
    userObj.update({_id:from},{$set:{socketid:socket.id}}).exec(function(err,users){
    //console.log("logged in User updated ",users)
      if (nicknames.indexOf(from) != -1){
            //callback(false);
            updateNicknames();
        } else{
            
            socket.nickname = from;
            nicknames.push(socket.nickname);
                console.log('user connected: ' + socket.nickname);
        //  io.emit('update_personal', nicknames + ': Online');

            updateNicknames();
            //callback(true);
        }

    })
     
  });

  // update all user name

    function updateNicknames(){
        io.sockets.emit('usernames', nicknames);
        console.log("online users ",nicknames)

    }
    socket.on('getOnline', function (data) {

      io.sockets.emit('usernames', nicknames);
    })
  /*socket.on('chat message', function(from,to,msg){
    console.log("from   ",from, " to   ",to," msg   ",msg)
    io.emit('chat message', msg);
   // io.in(rows[0].socketid).emit('send', {"message":msg});
  });*/
// when the client emits 'typing', we broadcast it to others
  socket.on('typing', function (data) {
   
    userObj.findOne({_id:data.to},{socketid:1,first_name:1}).exec(function(err,users){
      
      if(users.socketid!=""){
      /*io.in(users.socketid).emit('typing', {
                        username: data.from,
                        to:users.first_name
                      });*/
      socket.in(users.socketid).emit('typing', {
                        username: data.from,
                        to:users.first_name,
                        fromId:data.fromId
                      });
      }
       console.log("tytping",users)
       console.log("tytping socket",data)
    })
    /*socket.broadcast.emit('typing', {
      username: data.from,
                        to:"users.first_name",
                        fromId:data.fromId
    });*/
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function (data) {
    //console.log("stop tytping",data)

    userObj.findOne({_id:data.to},{socketid:1,first_name:1}).exec(function(err,users){
    if(users.socketid!=""){
      /*io.in(users.socketid).emit('stop typing', {
                        username: data.from,
                        to:users.first_name
                      });*/
      socket.in(users.socketid).emit('stop typing', {
                        username: data.from,
                        to:users.first_name,
                        fromId:data.fromId
                      });
    }
      console.log("stop typing",users)
       console.log("stop typing",data)
    })
    /*socket.broadcast.emit('stop typing', {
       username: data.from,
                        to:"users.first_name",
                        fromId:data.fromId
    });*/
  });

socket.on('sendMessage', function(message){
console.log("calling ", message)
  if(message.peer_id!=undefined){
    userObj.find({_id:message.peer_id},{socketid:1,plateform:1,device_id:1,logged_status:1}, function(err,users) {
   if (err) console.log(err);
   if (users) {

      //console.log("calling to ",JSON.stringify(users));
          if(!users[0].socketid){
              return; 
            }else{
             // console.log("calling to ",JSON.stringify(users));
              io.to(users[0].socketid).emit('messageReceived', message);
              //console.log("socket status ",users[0].socketid,"    " ,io.sockets.connected[users[0].socketid]);
            }

   }
 });
}else{
console.log('peer id not defined', message)

}
       
  

  });


//single chat message 
 socket.on('chat message',function(fromName,from,to,message)
  {

   console.log("from ",from," to ",to," message ",message)
   var msg1=message;
 userObj.find({_id:from},{socketid:1}, function(err,users) {
   if (err) console.log(err);
   if (users) {

    console.log(" message ",message);
    if(users[0].socketid!="")
    io.in(users[0].socketid).emit('send', {"message":message});
  
  //console.log(socketid);
  //console.log("reqdata ",req.params);
   

  }


  });
    
  userObj.find({_id:to},{socketid:1,plateform:1,device_id:1,logged_status:1}, function(err,users) {
   if (err) console.log(err);
   if (users) {

    console.log("msg ",msg1);
    if(users[0].socketid!=""){
    io.in(users[0].socketid).emit('receive', {"message":msg1,"user_id":from,"to":to});
  
  //console.log(socketid);
  setTimeout(function(){
      messageObj.find({$or: [{senderid:to }, {recieverid:to}],is_deleted:false,message:{$elemMatch:{is_read:false,recieverid:to}}}).exec(function(err, data) {console.log("err ",err);

        //console.log("data ",to)
        if(data.length>0){
          var i=0;
        data[0].message.forEach(function (commentContainer) {
            // Check if this comment contains banned phrases
            if (commentContainer.is_read== false && commentContainer.recieverid==to) {
                commentContainer.is_read = true;


            }
        });

        return data[0].save();
    }else{
      return true;
    }
      }).then(function () {
    console.log("Done saving") 
});

}, 1000);
 } 

//console.log(users)
  if (users[0].plateform == 'Android' && users[0].device_id != '' && users[0].logged_status == true) {



            //console.log("devices ",deviceIds) 
            var message = new gcm.Message({
              collapseKey: 'demo',
              priority: 'high',
              contentAvailable: true,
              delayWhileIdle: true,
              timeToLive: 3,
              restrictedPackageName: "somePackageName",
              dryRun: true,
              data: {
                title: fromName,
                body: "\u2709"+msg1
              },
              notification: {
                title: fromName,
                //icon: "ic_launcher",
                body: "\u2709"+msg1
              },
              registration_ids: [users[0].device_id]

            });
            /*var message = new gcm.Message({   
                     registration_ids: deviceIds,
                     data: {
                        title: data.title,
                        body: data.description
                    }   
                 });*/
            // send the message     
            gcmObject.send(message, function(err, response) {
              if (err) {
                console.log(err);
                //callback("notification failure");
              }
              console.log("response");
              console.log(response);
              //callback("notification success");



            });
          }
          if (users[0].plateform == 'iOS' && users[0].device_id != ''  && users[0].logged_status == true) {
            console.log("winner IOs");
            note.expiry = Math.floor(Date.now() / 1000) + 3600;
            note.badge = 1;
            note.sound = 'ping.aiff';
            //jobData[i].due_date.getDate()
            note.alert = "\u2709"+msg1;
            // note.payload = {
            //   'messageFrom': fromName
            // };
            note.payload = {'messageFrom': fromName};
            note.topic = "<your-app-bundle-id>";
            apnsConnection.pushNotification(note, users[0].device_id);
            // Handling these events to confirm the notification gets
            // transmitted to the APN server or find error if any
            apnsConnection.on('error', log('error'));
            apnsConnection.on('transmitted', log('transmitted'));
            apnsConnection.on('timeout', log('timeout'));
            apnsConnection.on('connected', log('connected'));
            apnsConnection.on('disconnected', log('disconnected'));
            apnsConnection.on('socketError', log('socketError'));
            apnsConnection.on('transmissionError', log('transmissionError'));
            apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));

            function log(type) {
              return function() {
                //callback("notification success");    
                console.log(type, arguments, arguments.toString('utf-8'));
              }
            }


          }
  }
});
  
    });
 
//When  the user logout..
  socket.on('disconnect', function () {
   console.log("auto disconnect ",socket.nickname);
    ///socket.io.connect();
   if(socket.id!=undefined){
    userObj.update({socketid:socket.id},{$set:{socketid:"",last_seen:new Date()}}, function(err,users) {
   if (err) console.log(err);
   if (users) {
    console.log("auto disconnect user ",socket.id);
    if(!socket.nickname){
      return;

    }else{
      if(nicknames.indexOf(socket.nickname)>-1){
        nicknames.splice(nicknames.indexOf(socket.nickname), 1);
        updateNicknames();
      }
      
    }
        
    //socket.emit("disconnected_user",{"socketid":socket.id});
    
  }
}); 
  }         
  }); 

  //When  the user logout..
  socket.on('forceDisconnect', function (userId) {
    console.log("logout data",userId);
   console.log("force disconnect ",socket.id);
   if(socket.id!=undefined){
    userObj.update({_id:userId},{$set:{socketid:"",last_seen:new Date()}}, function(err,users) {
   if (err) console.log(err);
   if (users) {
    console.log("force disconnect user ",socket.id);
    socket.emit("disconnected_user",{"socketid":socket.id});
    if(!userId){
      return;
    }else{
      if(nicknames.indexOf(userId)>-1){
        nicknames.splice(nicknames.indexOf(userId), 1);
        updateNicknames();
      }
      
    } 
        
    
  }
}); 
   }        
  }); 
});

http.listen(2087, function(){
  console.log('listening on *:2087');
});
