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

    this.agentList = {};

    this.getList = function() {
        var tmpList = this.agentList;
        for (var id in tmpList) {
            //tmpList[id].connid = tmpList[id].conn.id;
            delete tmpList[id].conn;
            delete tmpList[id].info;
        }
        return tmpList;
    };

    this.init = function (msg, conn, cb) {
        var connid = uuid.v1();
        conn.id = connid;

        console.log(conn.id + ' Agent INIT');

        var ag = new LoadAgent(msg.ip, msg.hostname, conn, msg.version, msg.info);
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
            ag.state = AGENT_STATE.READY_FOR_TEST;
            console.log(conn.id + ' Agent READY');
        }
        else {
            console.error('Agent not found for id:'+ conn.id);
        }
    };

    this.sysStats = function (msg, conn, cb) {
        //console.log(conn.id + ' SYS-STATS:' + JSON.stringify(msg.stats));
    };

    this.hadleDisconnect = function (connid) {
        console.log(connid + ' disconnected agent');
        this.agentList[connid].state = AGENT_STATE.DISCONNECTED;
    };

    this.testReady = function (msg, conn, cb) {
        console.error(conn.id + ' test init OK');
        this.agentList[conn.id].state = AGENT_STATE.TEST_INIT;
    };

    this.initTestFailed = function (msg, conn, cb) {
        console.error(conn.id + ' test init failed:' + msg.err);
        this.agentList[conn.id].state = AGENT_STATE.ERROR;
    };

    this.testStarted = function (msg, conn, cb) {
        console.error(conn.id + ' test init OK');
        this.agentList[conn.id].state = AGENT_STATE.TEST_RUNNING;
    };

    this.startTestFailed = function (msg, conn, cb) {
        console.error(conn.id + ' test start failed:' + msg.err);
        this.agentList[conn.id].state = AGENT_STATE.ERROR;
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
        else if (msg.type == 'testReady') {
            this.testReady(msg, conn, cb);
        }
        else if (msg.type == 'initTestFailed') {
            this.initTestFailed(msg, conn, cb);
        }
        else if (msg.type == 'testStarted') {
            this.testStarted(msg, conn, cb);
        }
        else if (msg.type == 'startTestFailed') {
            this.startTestFailed(msg, conn, cb);
        }
    };
}


function LoadAgent(ip, hostname, conn, version, info) {
    this.ip = ip;
    this.conn = conn;
    this.hostname = hostname;
    this.version = version;
    this.creationTime = Date.now();
    this.state = AGENT_STATE.INIT;
    this.info = info;
}

var AGENT_STATE = {
    INIT : 0,
    READY_FOR_TEST : 1,
    TEST_INIT : 1,
    TEST_RUNNING : 2,
    ERROR : 3,
    DISCONNECTED : 4
};

util.inherits(AgentMngr, EventEmitter);

module.exports = AgentMngr;
