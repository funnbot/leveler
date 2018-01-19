const EventEmitter = require("events");
let r = require("rethinkdbdash")();

class DB extends EventEmitter {
    constructor() {
        super()
        this.cache = {}
        this.setup()
           .then(() => this.load.apply(this));
    }

    get(id) {
        return this.cache[id] || 30;
    }

    set(id, data) {
        if (!data) delete this.cache[id]
        else this.cache[id] = data
        this.update(id);
    }

    update(id) {
        if (!id) return;
        let data = this.cache[id];
        if (!data) return;
        r.table("xp").insert({id, data}, {conflict: "replace"})
           .then(() => {})
           .catch(console.log)
        
    }


    async load() {
        try {
            var table = await r.table("xp");
        } catch(e) {
            throw e
        }
        for (let {id, data} of table) {
            if (!id || !data) continue;
            this.cache[id] = data;
        }
        this.emit("ready")
    }

    async setup() {
        try {
            var dblist = await r.dbList();
            if (!dblist.includes("Leveler")) {
                await r.dbCreate("Leveler");
            }
            r = r.db("Leveler");
            var tablelist = await r.tableList()
            if (!tablelist.includes("xp")) {
                await r.tableCreate("xp")
            }
        } catch (e) {
            throw e;
        }
        return;
    }
}

module.exports = DB