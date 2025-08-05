
const axios = require('axios')

const logUrl = 'http://20.244.56.144/evaluation-service/logs'
const stacks = ['backend', 'frontend']
const levels = ['debug', 'info', 'warn', 'error', 'fatal']
const pkgs = [
    'cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service',
    'auth', 'config', 'middleware', 'utils'
]

async function Log(stack, level, pkg, message) {
    var s = (stack + '').toLowerCase()
    var l = (level + '').toLowerCase()
    var p = (pkg + '').toLowerCase()
    if (stacks.indexOf(s) === -1) {
        return
    }
    if (levels.indexOf(l) === -1) {
        return
    }
    if (pkgs.indexOf(p) === -1) {
        return
    }
    try {
        await axios.post(logUrl, {
            stack: s,
            level: l,
            package: p,
            message: message
        })
    } catch (err) {
        // ignore
    }
}

module.exports = { Log }
