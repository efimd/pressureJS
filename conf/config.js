/**
 * Created with IntelliJ IDEA.
 * User: efim
 * Date: 3/29/14
 * Time: 10:09 PM
 * To change this template use File | Settings | File Templates.
 */

var config = {
    agentPort : 8888,
    agentPath : '/agent',
    UIport : 8881,
    UIpath : '/ui',
    _version : require('../package.json').version
};
module.exports = config;