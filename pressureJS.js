/**
 * Created with IntelliJ IDEA.
 * User: efim
 * Date: 3/29/14
 * Time: 10:25 PM
 * To change this template use File | Settings | File Templates.
 */

var config = require('./conf/config');
var cfg = config;
var AgentMngr = require('./lib/agentMngr');
var agentMngr = new AgentMngr();



var WebSocketServer = require('ws').Server;
var wssAgents = new WebSocketServer({
    port: cfg.agentPort
});

wssAgents.on('connection', function(conn) {

    conn.on('message', function(messageTxt) {
        try {
            var msgJSON = JSON.parse(messageTxt);
            agentMngr.handleMessage(msgJSON, conn);
        }
        catch (e) {
            console.error('Parsing error for message:'+ messageTxt + ' e:'+e);
        }

//        console.log('received: %s', messageTxt);
    });

    conn.on('close', function () {
        agentMngr.hadleDisconnect(conn.id);
        console.log('connection closed:',this.id);
    });

});




var wssUI = new WebSocketServer({
    port: cfg.UIport
});

wssUI.on('connection', function(conn) {
    conn.on('message', function(message) {
        console.log('received: %s', message);
    });

    conn.on('close', function () {

    });

    conn.send('something');
});