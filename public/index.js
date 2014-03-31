/**
 * Created with IntelliJ IDEA.
 * User: efim
 * Date: 3/31/14
 * Time: 10:47 AM
 * To change this template use File | Settings | File Templates.
 */

var wsUri = "ws://localhost:8881/ui";
var websocket;

var AGENT_STATE = {
    "0" : "Initializing",
    "10" : "Ready for Test",
    "20" : "Test Initializing",
    "30" : "Test Running",
    "40" : "Error",
    "50" : "Disconnected"
};

function init() {
    startWebSocket();
}

function startWebSocket() {
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) {
        console.log('OPEN');
        var msg = {
            type : 'agentList'
        };
        websocket.send(JSON.stringify(msg));
    };
    websocket.onclose = function(evt) {
        console.log('CLOSE');

    };
    websocket.onmessage = function(evt) {
        var msg = {};
        try {
            msg = JSON.parse(evt.data);
        }
        catch (e) {
            console.error('Error parsing message');
        }
        console.log('MESSAGE:' + evt.data.type);
        var tbl = $('#loadAgentListTbl').dataTable();

        if (msg.type == 'agentList') {
            tbl.fnClearTable();
            for (var id in msg.data) {
                var ag = msg.data[id];
                tbl.fnAddData( [
                                ag.id,
                                ag.ip,
                                ag.hostname,
                                ag.info.platform,
                                AGENT_STATE[ag.state]
                ]);
            }
        }
        else if (msg.type == 'agentAdded') {
            var ag = msg.data;
            var addId = tbl.fnAddData( [
                ag.id,
                ag.ip,
                ag.hostname,
                ag.info.platform,
                AGENT_STATE[ag.state]
            ]);

            var theNode = $('#loadAgentListTbl').dataTable().fnSettings().aoData[addId[0]].nTr;
            theNode.setAttribute('id',ag.id);
        }
        else if (msg.type == 'agentUpdate') {
            var ag = msg.data;
            tbl.fnUpdate( [
                ag.id,
                ag.ip,
                ag.hostname,
                ag.info.platform,
                AGENT_STATE[ag.state]
            ], $('#'+ag.id)[0] );
        }


//        var tbl = prettyPrint( msg , {
//            expanded: false, // Expanded view (boolean) (default: true),
//            maxDepth: 7
//        });
//        document.body.appendChild(tbl);
    };
    websocket.onerror = function(evt) {
        console.log('ERROR');
    };


}
init();