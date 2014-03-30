/**
 * Created with IntelliJ IDEA.
 * User: efim
 * Date: 3/29/14
 * Time: 11:14 PM
 * To change this template use File | Settings | File Templates.
 */

var uuid = require('node-uuid');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var agentConfig = require('../conf/agentConfig');

var config = require('../conf/config');
var cfg = config;

function AgentMngr() {
    EventEmitter.call(this);
    var self = this;

    this.agentList = {};

    this.init = function (msg, conn, cb) {
        var connid = uuid.v1();
        conn.id = connid;

        console.log(conn.id + ' Agent INIT');

        var ag = new LoadAgent(msg.ip, msg.hostname, conn);
        this.agentList[connid] = ag;

        var msg = {
            type : 'initConfig',
            id : connid,
            meta : {
                ver : cfg._version
            },
            config : agentConfig
        };
        conn.send(JSON.stringify(msg));

        if (cb) {cb();}
    };

    this.ready = function (msg, conn, cb) {
        var ag = this.agentList[conn.id];
        if (ag) {
            ag.state = AGENT_STATE.READY;
            console.log(conn.id + ' Agent READY');
        }
        else {
            console.error('Agent not found for id:'+ conn.id);
        }
    };

    this.sysStats = function (msg, conn, cb) {
        console.log(conn.id + ' SYS-STATS:' + JSON.stringify(msg.stats));
    };

    this.hadleDisconnect = function (connid) {
        console.log('removing agent for conn id:' + connid);
        delete this.agentList[connid];
    };

    this.handleMessage = function (msg, conn, cb) {
        if (msg.type == 'init') {
            this.init(msg, conn, cb);
        }
        else if (msg.type == 'ready') {
            this.ready(msg, conn, cb);
        }
        else if (msg.type == 'sysStats') {
            this.sysStats(msg, conn, cb);
        }
    };
}


function LoadAgent(ip, hostname, conn) {
    this.ip = ip;
    this.connid = conn;
    this.hostname = hostname;
    this.creationTime = Date.now();
    this.state = AGENT_STATE.INIT;
}


var AGENT_STATE = {
    INIT : 0,
    READY : 1,
    RUNNING : 2,
    ERROR : 3
};

util.inherits(AgentMngr, EventEmitter);

module.exports = AgentMngr;
