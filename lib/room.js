/**
 * Created with IntelliJ IDEA.
 * User: efim
 * Date: 3/31/14
 * Time: 1:08 PM
 * To change this template use File | Settings | File Templates.
 */


function Room() {
    this.participants = {};

    this.join = function (id, conn) {
        if (!this._exists(id)) {
            this.cnt++;
            this.participants[id] = conn;
        }
        else {
            console.error('Duplicate join for id:'+id);
        }
    };

    this.leave = function (id) {
        if (this._exists(id)) {
            this.cnt--;
            delete this.participants[id];
        }
        else {
            console.error('Leaving a room that was not joined:' + id);
        }
    };

    this.broadcast = function (msg) {
        var msg_txt = JSON.stringify(msg);

        for (var id in this.participants) {
            var p_con = this.participants[id];
            p_con.send(msg_txt);
        }
    };

    this._exists = function (id) {
        if (this.participants[id]) {
            return true;
        }
        return false;
    };
}


module.exports = Room;