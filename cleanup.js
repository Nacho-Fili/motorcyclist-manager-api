exports.Cleanup = function (callback) {
    callback = callback || (() => {})
    process.on('cleanup', callback)

    process.on('exit', () => process.emit('cleanup'))

    process.on('SIGINT', () => process.exit(2))

    process.on('uncaughtException', e => {
        console.log(e.stack)
        process.exit(99)
    })
} 
