if(process.env.NODE_ENV !== 'test') {
    module.exports = require('./logger.js')
}
else {
    module.exports = require('./emptyLogger.js')
}
