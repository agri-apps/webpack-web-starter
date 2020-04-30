const createStore = (initialState = {}, changeFn) => {

    return {
        _store: initialState,

        _watchers: {},

        _changeFn: typeof changeFn === 'function' ? changeFn : null,

        getStore() {
            return Object.assign({}, this._store);
        },

        get(key) {
            return this._store[key];
        },

        remove(key) {
            this.set(key, null);
        },

        set(key, newValue) {
            const oldValue = this._store[key],
                equal = JSON.stringify(oldValue) === JSON.stringify(newValue);

            if (!equal) {
                this._store[key] = newValue;

                if (newValue === null) {
                    delete this._store[key];
                }

                if (this._watchers[key]) {
                    this._watchers[key].forEach( watcher => {
                        const fn = watcher[1];
                        fn(newValue, oldValue);
                    });
                }

                if (this._changeFn) {
                    this._changeFn({key, newValue, oldValue, state: this.getStore()});
                }
            }
        },

        watch(key, fn, id = false) {
            if (!this._watchers[key]) {
                this._watchers[key] = []
            }
            this._watchers[key].push([id, fn]);
        },

        unwatch(key, id = false) {
            this._watchers[key] = id !== false ?
                this._watchers[key].filter(watcher => watcher[0] !== id) :
                this._watchers[key] = [];
        }
    }
}

export default createStore;