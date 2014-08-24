var rethinkdbAdapter = require(__base + '/models/adapter');

module.exports = {
    adapters: {
        'default': rethinkdbAdapter,
        rethinkdb: rethinkdbAdapter
    },
    connections: {
        rethinkdb: {
            adapter: 'rethinkdb',
            host: "db.dutra.io",
            port: 28015,
            authKey: "",
            db: "fenwayjs"
        }
    },
    express: {
        port: 3000
    }
}
