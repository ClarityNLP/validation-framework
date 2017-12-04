class DataStore {
    constructor(data) {
        this.curIndex = (data && data.length) || 0;
        this._cache = data || [];
    }

    addObject(data) {
        if (data) {
            data.id = this.curIndex;
            this._cache[this.curIndex] = data;
            this.curIndex += 1;
        }
    }


    getObjectAt(index) {
        if (index < 0 || index > this.size){
            return undefined;
        }
        if (this._cache[index] === undefined) {
            console.log(index + " not found!");
            return undefined;
        }
        return this._cache[index];
    }

    getAll() {
        if (this._cache.length < this.size) {
            for (let i = 0; i < this.size; i++) {
                this.getObjectAt(i);
            }
        }
        return this._cache.slice();
    }

    getSize() {
        return this.curIndex;
    }
}

export default DataStore;