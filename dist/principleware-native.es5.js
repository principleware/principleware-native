/**
 * Extends a given promise into a deferred object of jQuery.
 * With this extension, we are able to chain together jQuery deferred
 * objects (which are also promise objects.)
 * @param {?} promise
 * @return {?}
 */
/**
 * @param {?} fn
 * @return {?}
 */
function asap(fn) {
    setTimeout(fn, 1);
}
/**
 * @param {?} fn
 * @param {?} thisArg
 * @return {?}
 */
function bind(fn, thisArg) {
    return function () {
        fn.apply(thisArg, arguments);
    };
}
var isArray = Array.isArray || function (value) { return Object.prototype.toString.call(value) === "[object Array]"; };
/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 * @param {?} fn
 * @param {?} onFulfilled
 * @param {?} onRejected
 * @return {?}
 */
function doResolve(fn, onFulfilled, onRejected) {
    var /** @type {?} */ done = false;
    try {
        fn(function (value) {
            if (done) {
                return;
            }
            done = true;
            onFulfilled(value);
        }, function (reason) {
            if (done) {
                return;
            }
            done = true;
            onRejected(reason);
        });
    }
    catch (ex) {
        if (done) {
            return;
        }
        done = true;
        onRejected(ex);
    }
}
/**
 * @param {?} deferred
 * @return {?}
 */
function handle(deferred) {
    var /** @type {?} */ me = this;
    if (this._state === null) {
        this._deferreds.push(deferred);
        return;
    }
    asap(function () {
        var /** @type {?} */ cb, /** @type {?} */ ret;
        cb = me._state ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
            (me._state ? deferred.resolve : deferred.reject)(me._value);
            return;
        }
        try {
            ret = cb(me._value);
        }
        catch (e) {
            deferred.reject(e);
            return;
        }
        deferred.resolve(ret);
    });
}
/**
 * @return {?}
 */
function finale() {
    var /** @type {?} */ i, /** @type {?} */ len;
    /*jslint plusplus:true */
    for (i = 0, len = this._deferreds.length; i < len; i++) {
        handle.call(this, this._deferreds[i]);
    }
    this._deferreds = null;
}
/**
 * @param {?} newValue
 * @return {?}
 */
function reject(newValue) {
    this._state = false;
    this._value = newValue;
    finale.call(this);
}
/**
 * @param {?} newValue
 * @return {?}
 */
function resolve(newValue) {
    try {
        if (newValue === this) {
            throw new TypeError('A promise cannot be resolved with itself.');
        }
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
            var /** @type {?} */ then = newValue.then;
            if (typeof then === 'function') {
                doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
                return;
            }
        }
        this._state = true;
        this._value = newValue;
        finale.call(this);
    }
    catch (e) {
        reject.call(this, e);
    }
}
/**
 * Defines a dummy promise, which simulates the behavior of a normal Promise
 * but is suitable used in synchronous call.
 * This resulted object is also a jQuery deferred object, therefore,
 * it will be resolved by the jQuery deferred object if it is a resolved value in
 * the jQuery deferred object.
 * @template T
 * @param {?} fn
 * @return {?}
 */
function DummyPromise(fn) {
    if (typeof this !== 'object') {
        throw new TypeError('Promises must be constructed via new');
    }
    if (typeof fn !== 'function') {
        throw new TypeError('not a function');
    }
    this._state = null;
    this._value = null;
    this._deferreds = [];
    doResolve(fn, bind(resolve, this), bind(reject, this));
}
/**
 * @param {?} onFulfilled
 * @param {?} onRejected
 * @param {?} resolve
 * @param {?} reject
 * @return {?}
 */
function Handler(onFulfilled, onRejected, resolve, reject) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.resolve = resolve;
    this.reject = reject;
}
DummyPromise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
};
DummyPromise.prototype.then = function (onFulfilled, onRejected) {
    var /** @type {?} */ me = this;
    return new DummyPromise(function (resolve, reject) {
        handle.call(me, new Handler(onFulfilled, onRejected, resolve, reject));
    });
};
DummyPromise.prototype.all = function (arrayArg) {
    var /** @type {?} */ args = Array.prototype.slice.call(arguments.length === 1 && isArray(arrayArg) ? arrayArg : arguments);
    return new DummyPromise(function (resolve, reject) {
        if (args.length === 0) {
            return resolve([]);
        }
        var /** @type {?} */ remaining = args.length, /** @type {?} */ i;
        /**
         * @param {?} i
         * @param {?} val
         * @return {?}
         */
        function res(i, val) {
            try {
                if (val && (typeof val === 'object' || typeof val === 'function')) {
                    var /** @type {?} */ then = val.then;
                    if (typeof then === 'function') {
                        then.call(val, function (val) { res(i, val); }, reject);
                        return;
                    }
                }
                args[i] = val;
                /*jslint plusplus: true */
                if (--remaining === 0) {
                    resolve(args);
                }
            }
            catch (ex) {
                reject(ex);
            }
        }
        /*jslint plusplus: true */ for (i = 0; i < args.length; i++) {
            res(i, args[i]);
        }
    });
};
DummyPromise.prototype.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === DummyPromise) {
        return value;
    }
    return new DummyPromise(function (resolve) {
        resolve(value);
    });
};
DummyPromise.prototype.reject = function (value) {
    /*jslint unparam: true */
    return new DummyPromise(function (resolve, reject) {
        reject(value);
    });
};
DummyPromise.prototype.race = function (values) {
    return new DummyPromise(function (resolve, reject) {
        var /** @type {?} */ i, /** @type {?} */ len;
        /*jslint plusplus: true */
        for (i = 0, len = values.length; i < len; i++) {
            values[i].then(resolve, reject);
        }
    });
};
DummyPromise.prototype.always = function (onFulfilled) {
    return this.then(onFulfilled, onFulfilled);
};
DummyPromise.prototype.done = function (onFulfilled) {
    return this.then(onFulfilled);
};
DummyPromise.prototype.fail = function (onRejected) {
    return this.then(null, onRejected);
};
DummyPromise.prototype.promise = function () {
    return this;
};
DummyPromise.prototype.progress = function () {
    return this;
};

/**
 * @param {?} x
 * @return {?}
 */
function isFunction(x) {
    return typeof x === 'function';
}

// 
// Author:: Tom Tang <principleware@gmail.com>
// Copyright:: Copyright (c) 2017, Tom Tang
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// 
// Except as contained in this notice, the name(s) of the above copyright
// holders shall not be used in advertising or otherwise to promote the
// sale, use or other dealings in this Software without prior written
// authorization.
/**
 * Lifts a single value or a function into a Promise-like object.
Provides a method of wrapping a single value or a function  into a Promise,
in order that the following operation
may conform to the standard Promise operation.
In some scenario, we may first attempt to get a value from cache.
Motivation.
In this case, we need to return a value. However, if the value is
not available in the cache, we may have to go ahead to load it
asynchronously. Loading a value asynchronously usually returns
a Promise. To untify the return from two cases, we
escalate a single value into a Promise.
 * @template T
 * @param {?} value
 * @param {?} thisArg
 * @return {?}
 */
function lift(value, thisArg) {
    /*jslint unparam: true */
    return new DummyPromise(function (resolve, reject) {
        if (isFunction(value)) {
            var /** @type {?} */ restArgs = [];
            /*jslint plusplus: true */
            for (var /** @type {?} */ i = 2; i < arguments.length; i++) {
                restArgs.push(arguments[i]);
            }
            var /** @type {?} */ ret = value.apply(thisArg || null, restArgs);
            resolve(ret);
        }
        else {
            resolve(value);
        }
    });
}
/**
 * Replaces the placeholders a given format with the given parameters.
 * @param {?} format
 * @param {?} params
 * @return {?}
 */
function replace(format, params) {
    /*jslint unparam: true */
    return format.replace(/\{([a-zA-Z]+)\}/g, function (s, key) {
        return (typeof params[key] === 'undefined') ? '' : params[key];
    });
}

/**
 * @fileOverview
 * Defines a Sqlite databse
 * @name SqliteDatabase.js
 * @module hypercom/storage/SqliteDatabase
 * @author Xiaolong Tang <xxlongtang@gmail.com>
 * @license Copyright @me
 */
var workingDbs = {};
/**
 * @param {?} name
 * @param {?} platform
 * @return {?}
 */
function makeOptions(name, platform) {
    var /** @type {?} */ options = { name: name };
    if (platform.ios) {
        options['iosDatabaseLocation'] = 'default';
    }
    else if (platform.android) {
        options['location'] = 'default';
    }
    return options;
}
var SqliteDatabase = (function () {
    /**
     * @param {?} sqlite
     * @param {?} dbName
     * @param {?} dbSchema
     * @param {?} platform
     */
    function SqliteDatabase(sqlite, dbName, dbSchema, platform) {
        this.sqlite = sqlite;
        this.dbName = dbName;
        this.dbSchema = dbSchema;
        this.platform = platform;
    }
    /**
     * Inits a database.
     * @return {?}
     */
    SqliteDatabase.prototype.initDBPromise = function () {
        var _this = this;
        var /** @type {?} */ cache = workingDbs[this.dbName];
        if (cache) {
            cache.referenceCounter = cache.referenceCounter + 1;
            return lift(cache.database, null);
        }
        var /** @type {?} */ options = makeOptions(this.dbName, this.platform);
        return this.sqlite.create(options)
            .then(function (db) {
            var /** @type {?} */ tables = [];
            for (var /** @type {?} */ k in _this.dbSchema) {
                if (_this.dbSchema.hasOwnProperty(k)) {
                    var /** @type {?} */ v = _this.dbSchema[k];
                    tables.push(v.create);
                }
            }
            var /** @type {?} */ promises = tables.map(function (elem) {
                return db.executeSql(elem, {});
            });
            return Promise.all(promises)
                .then(function () {
                workingDbs[_this.dbName] = {
                    referenceCounter: 1,
                    database: db
                };
                return db;
            });
        })
            .catch(function (e) { return console.log(e); });
    };
    /**
     * @return {?}
     */
    SqliteDatabase.prototype.deleteDBPromise = function () {
        var /** @type {?} */ cache = workingDbs[this.dbName];
        if (cache) {
            throw new Error('Still in use, please close first');
        }
        var /** @type {?} */ options = makeOptions(this.dbName, this.platform);
        return this.sqlite.deleteDatabase(options);
    };
    /**
     * Closes the database.
     * @return {?}
     */
    SqliteDatabase.prototype.closeDBPromise = function () {
        var /** @type {?} */ cache = workingDbs[this.dbName];
        if (!cache) {
            return lift(true, null);
        }
        cache.referenceCounter = cache.referenceCounter - 1;
        if (cache.referenceCounter > 0) {
            return lift(true, null);
        }
        return cache.database.close();
    };
    /**
     * Inserts data into the given table.
     * @param {?} table
     * @param {?} data
     * @return {?}
     */
    SqliteDatabase.prototype.insertPromise = function (table, data) {
        var /** @type {?} */ schema = this.dbSchema[table];
        var /** @type {?} */ cache = workingDbs[this.dbName];
        if (!cache || !schema) {
            throw new Error('No database instance');
        }
        return cache.database.executeSql(schema.insert, data)
            .then(function (result) {
            return result;
        })
            .catch(function (e) {
            console.log(e);
            return 0;
        });
    };
    /**
     * Selects from the given table.
     * @param {?} table
     * @param {?=} selectSql
     * @return {?}
     */
    SqliteDatabase.prototype.selectPromise = function (table, selectSql) {
        var /** @type {?} */ schema = this.dbSchema[table];
        var /** @type {?} */ cache = workingDbs[this.dbName];
        if (!cache || !schema) {
            throw new Error('No database instance');
        }
        return cache.database.executeSql(selectSql || schema.select, {})
            .then(function (result) {
            var /** @type {?} */ records = [];
            for (var /** @type {?} */ i = 0; i < result.rows.length; i++) {
                records.push(result.rows.item(i));
            }
            return records;
        })
            .catch(function (e) {
            console.log(e);
            return [];
        });
    };
    /**
     * Deletes records with the given id or range
     * @param {?} table
     * @param {?} id
     * @param {?=} lastId
     * @return {?}
     */
    SqliteDatabase.prototype.deletePromise = function (table, id, lastId) {
        var /** @type {?} */ schema = this.dbSchema[table];
        var /** @type {?} */ cache = workingDbs[this.dbName];
        if (!cache || !schema) {
            throw new Error('No database instance');
        }
        var /** @type {?} */ where = '';
        if (lastId) {
            where = 'WHERE id > ' + id + ' AND id < ' + lastId;
        }
        else {
            where = id === 0 ? 'WHERE id > 0' : 'WHERE id=' + id;
        }
        var /** @type {?} */ stmt = replace(schema.remove, { where: where });
        return cache.database.executeSql(stmt, {});
    };
    /**
     * Deletes records with the given where condition
     * @param {?} table
     * @param {?} where
     * @return {?}
     */
    SqliteDatabase.prototype.deleteWherePromise = function (table, where) {
        var /** @type {?} */ schema = this.dbSchema[table];
        var /** @type {?} */ cache = workingDbs[this.dbName];
        if (!cache || !schema) {
            throw new Error('No database instance');
        }
        var /** @type {?} */ stmt = replace(schema.remove, { where: where });
        return cache.database.executeSql(stmt, {});
    };
    /**
     * Updates the given with the given value.
     * @param {?} table
     * @param {?} value
     * @param {?=} where
     * @return {?}
     */
    SqliteDatabase.prototype.updatePromise = function (table, value, where) {
        if (where === void 0) { where = ''; }
        var /** @type {?} */ schema = this.dbSchema[table];
        var /** @type {?} */ cache = workingDbs[this.dbName];
        if (!cache || !schema) {
            throw new Error('No database instance');
        }
        var /** @type {?} */ stmt = 'UPDATE ' + table + ' SET ' + value + ' ' + where;
        return cache.database.executeSql(stmt, {});
    };
    return SqliteDatabase;
}());

/**
 * @fileOverview
 * Defines a class for representing the key-pair table.
 */
var DefaultLiveSession = 2 * 60;
/**
 * \@class KeyPairTable
 */
var MapTable = (function () {
    /**
     * @param {?} tableName
     * @param {?} configuration
     * @param {?} database
     * @param {?} _cache
     */
    function MapTable(tableName, configuration, database, _cache) {
        this.tableName = tableName;
        this.configuration = configuration;
        this.database = database;
        this._cache = _cache;
    }
    /**
     * Inserts the given value for the given key.
     * @param {?} key
     * @param {?} value
     * @return {?}
     */
    MapTable.prototype.insertP = function (key, value) {
        // parse into value 
        value = this.configuration[key].parser.call(null, value);
        var /** @type {?} */ ret = this.database.insertPromise(this.tableName, [key, value]);
        return ret.then(function (insertId) {
            var /** @type {?} */ record = {
                key: key,
                value: value,
                id: insertId
            };
            if (this.cache) {
                var /** @type {?} */ cacheKey = this.configuration[key].cacheKey;
                this._cache.set(cacheKey, record, DefaultLiveSession);
            }
            return record;
        });
    };
    /**
     * Updtes the given reocrd; the record value has been updated.
     * @param {?} record
     * @param {?} newValue
     * @return {?}
     */
    MapTable.prototype.updateP = function (record, newValue) {
        newValue = this.configuration[record.key].parser.call(null, newValue);
        if (record.id === 0) {
            return this.insertP(record.key, newValue);
        }
        var /** @type {?} */ ret = this.database.updatePromise(this.tableName, 'value = ' +
            (typeof newValue === 'string' ? '"' + newValue + '"' : newValue), 'WHERE id = ' + record.id);
        return ret.then(function () {
            if (this._cache) {
                var /** @type {?} */ cacheKey = this.configuration[record.key].cacheKey;
                record.value = newValue;
                this._cache.set(cacheKey, record, DefaultLiveSession);
            }
            return record;
        });
    };
    /**
     * Returns the infomation about the given key.
     * @param {?} key
     * @return {?}
     */
    MapTable.prototype.getP = function (key) {
        if (this._cache) {
            var /** @type {?} */ cachedItem = this._cache.get(this.configuration[key].cacheKey);
            if (cachedItem) {
                return lift(cachedItem, null);
            }
        }
        var /** @type {?} */ stmt = 'SELECT * FROM ' + this.tableName + ' WHERE key like "' + key + '"';
        var /** @type {?} */ ret = this.database.selectPromise(this.tableName, stmt);
        return ret.then(function (records) {
            var /** @type {?} */ record;
            if (records.length > 0) {
                record = {
                    key: key,
                    value: records[0],
                    id: records[0].id
                };
                if (this.configuration[key].reader) {
                    record.value = this.configuration[key].reader.call(null, record.value);
                }
            }
            else {
                record = {
                    key: key,
                    value: this.configuration[key].defaultValue,
                    id: 0
                };
            }
            if (this._cache) {
                var /** @type {?} */ cacheKey = this.configuration[key].cacheKey;
                this._cache.set(cacheKey, record, DefaultLiveSession);
            }
            return record;
        });
    };
    /**
     * Cleans all database record.
     * @return {?}
     */
    MapTable.prototype.resetP = function () {
        // clean all cache first
        if (this._cache) {
            this._cache.reset();
        }
        return this.database.deletePromise(this.tableName, 0);
    };
    return MapTable;
}());

/**
 * Generated bundle index. Do not edit.
 */

export { SqliteDatabase, MapTable };
//# sourceMappingURL=principleware-native.es5.js.map
