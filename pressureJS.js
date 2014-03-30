/**
 * Created with IntelliJ IDEA.
 * User: efim
 * Date: 3/29/14
 * Time: 10:25 PM
 * To change this template use File | Settings | File Templates.
 */

var http = require('http');
var express = require('express');

var config = require('./conf/config');
var cfg = config;
var AgentMngr = require('./lib/agentMngr');
var agentMngr = new AgentMngr();

var WebSocketServer = require('ws').Server;

var app = express();


var wssAgents = new WebSocketServer({
    port : cfg.agentPort,
    path : cfg.agentPath
});
console.log('Server: Agent listening on:' + cfg.agentPort + ' path:'+cfg.agentPath);

wssAgents.on('connection', function(conn) {

    conn.on('message', function(messageTxt) {
        try {
            var msgJSON = JSON.parse(messageTxt);
        }
        catch (e) {
            console.error('Parsing error for message:'+ messageTxt + ' e:'+e);
        }

        try {
            agentMngr.handleMessage(msgJSON, conn);
        }
        catch (e) {
            console.error(conn.id + ' Error executing message:'+ msgJSON.type + ' e:'+e);
        }
//        console.log('received: %s', messageTxt);
    });

    conn.on('close', function () {
        agentMngr.hadleDisconnect(conn.id);
        console.log(this.id + ' connection closed');
    });


//    setTimeout(function () {
//        conn.send(JSON.stringify({
//            type : 'initTest',
//            name : 'sockJS'
//        }));
//    }, 5000);
//
//    setTimeout(function () {
//        conn.send(JSON.stringify({
//            type : 'startTest',
//            name : 'sockJS'
//        }));
//    }, 7000);

});



app.use(express.static(__dirname + '/public'));

var server = http.createServer(app);
server.listen(cfg.UIport);
console.log('Server: UI listening on:' + cfg.UIport);

var wssUI = new WebSocketServer({
    server: server,
    path: cfg.UIpath
});

wssUI.on('connection', function(conn) {
    conn.on('message', function(message) {
        console.log('UI received: %s', message);
        var msg = JSON.parse(message);

        if (msg.type == 'agentList') {
            conn.send(JSON.stringify(agentMngr.getList()));
        }
    });

    conn.on('close', function () {

    });
});