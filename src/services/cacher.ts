import cache from 'node-cache'


class internalCache {
    private cacher: any;
    constructor() {
        this.cacher = new cache()
    }


    async setter(key: string, val: {}) {
        return this.cacher.set(key, val)

    }

    async getter(key: string) {
        return this.cacher.get(key)
    }

    async deleter(key: string) {
        return this.cacher.del(key)
    }

    async reset() {
        return this.cacher.flushAll()
    }

}


const cacher = new internalCache()
export default cacher;