const arraySorter = require('./array-sorter');

/**
 * @typedef {{
 *   version: number,
 *   databaseName: string,
 *   tableName: string,
 *   primaryKey: {
 *     name: string,
 *     autoIncrement: boolean,
 *   },
 *   initData?: Array<{
 *     [key: string]: any,
 *   }>,
 *   structure: Array<{
 *      [key: string]: {
 *        unique?: boolean,
 *        multiEntry?: boolean,
 *      },
 *   }>
 * }} Config
 */

class Model {
  constructor() {
    this.tableName = this.config.tableName || 'table';

    this.fingersCrossed = new Promise((resolve, reject) => {
      if (!window || !('indexedDB' in window)) {
        return reject('Unsupported environment');
      }

      if (Array.isArray(this.config)) {
        return reject('Config has to be an Object');
      }

      const version = this.config.version || 1;
      const request = window.indexedDB.open(this.config.databaseName || 'db', version);

      request.onerror = function (event) {
        return reject('Unexpected exception: ', event.target || event);
      };

      request.onsuccess = function () {
        const connection = request.result;
        connection.onversionchange = function () {
          connection.close();
          console.info('connection closed...');
        };

        return resolve(request.result);
      };

      request.onblocked = function (event) {
        event.target.result.close();
        console.warn('blocked');
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (
          (event.oldVersion < version && event.oldVersion !== 0) ||
          db.objectStoreNames.contains(this.config.tableName)
        ) {
          db.deleteObjectStore(this.config.tableName);
          console.info('Table: ', this.config.tableName, ' removed');
        }
        const store = db.createObjectStore(this.config.tableName, {
          keyPath: this.config.primaryKey?.name || 'id',
          autoIncrement: this.config.primaryKey?.autoIncrement || true,
        });

        for (const key in this.config.structure) {
          if (this.config.structure.hasOwnProperty(key)) {
            store.createIndex(`Index-${key}`, key, {
              unique: !!this.config.structure[key].unique,
              multiEntry: !!this.config.structure[key].multiEntry,
            });
          }
        }

        for (const data of this.config.initData || []) {
          store.add(data);
        }
      };
    });
  }

  /**
   * @constructor
   * @returns {Config}
   */
  get config() {
    return {
      version: 1,
      databaseName: 'DefaultDatabase',
      tableName: 'roomTableView',
      primaryKey: {
        name: 'id',
        autoIncrement: true,
      },
      initData: [],
      structure: {
        roomId: { unique: false, multiEntry: true },
        roomName: { unique: false, multiEntry: false },
        task: { unique: false, multiEntry: false },
      },
    };
  }

  /**
   * @description This method is used to get the structure of the table, verify and return it.
   * @param {{[key:string]: any}} data
   * @returns {{[key:string]: any}}
   */
  verify(data) {
    const keys = Object.keys(data);
    for (const key of keys) {
      if (!this.config.structure?.[key] && this.config.primaryKey?.name !== key) {
        throw new Error(`{${key}} is not a valid key. Not defined in configuration [structure].`);
      }
    }

    if (this.config.primaryKey?.autoIncrement === false) {
      if (!keys.includes(this.config.primaryKey?.name)) {
        throw new Error('Either include primary key as well or set {autoincrement: true}.');
      }
    }

    return data;
  }

  /**
   * @description This method is used to insert data into the table.
   * @param {{[key: string]: any}} data
   * @returns {Promise<any>}
   */
  insertData(data) {
    const verifiedInsertData = this.verify(data);

    return new Promise((resolve, reject) => {
      this.fingersCrossed.then((db) => {
        const request = db
          .transaction([this.tableName], 'readwrite')
          .objectStore(this.tableName)
          .add(verifiedInsertData);

        request.onsuccess = function () {
          return resolve(db);
        };

        request.onerror = function () {
          reject('Unable to add data. Check the unique values');
        };
      });
    });
  }

  /**
   * @description This method is used to select data from the table.
   * @param {string} pKey
   * @returns {Promise<any>}
   */
  selectFrom(pKey) {
    return new Promise((resolve, reject) => {
      this.fingersCrossed.then((db) => {
        const transaction = db.transaction([this.tableName]);
        const objectStore = transaction.objectStore(this.tableName);
        const request = objectStore.get(pKey);
        request.onerror = function () {
          return reject('Unable to retrieve data from the model');
        };
        request.onsuccess = function () {
          if (request.result) {
            return resolve(request.result);
          } else {
            return reject('No result found');
          }
        };
      });
    });
  }

  selectAll() {
    return new Promise((resolve, reject) => {
      this.fingersCrossed.then((db) => {
        const objectStore = db.transaction(this.tableName).objectStore(this.tableName);
        const request = objectStore.getAll();
        request.onsuccess = () => {
          if (request.result) {
            return resolve(request.result);
          } else {
            return reject('No result found');
          }
        };
        request.onerror = function () {
          return reject("Can't get data from database");
        };
      });
    });
  }

  /**
   * @description This method is used to select data from the table.
   * @param {{
   *   where: function({}),
   *   limit?: number,
   *   orderByDESC?: boolean,
   *   sortBy?: string | string[]
   * }} options
   * @returns {Promise<any>}
   */
  selectWhere(options) {
    const props = new Proxy(options, {
      get: function (target, name) {
        return name in target ? target[name] : false;
      },
    });

    return new Promise((resolve, reject) => {
      this.selectAll().then(resolve).catch(reject);
    }).then((dataBucket) => {
      const result = { val: [] };
      if ('where' in props && props.where !== false) {
        if (dataBucket.length === 0) return [];

        if (typeof props.where === 'function') {
          // exec callback fn and return
          result.val = props.where.call(dataBucket, dataBucket);
        }
      }

      if ('sortBy' in props && props.sortBy) {
        // sort data
        result.val = arraySorter(result.val).sortBy({
          desc: 'orderByDESC' in props && props.orderByDESC,
          keys: [props.sortBy],
        });
      }

      if ('limit' in props && props.limit !== false) {
        // slice data
        result.val = result.val.slice(0, +props.limit);
      }

      return result.val;
    });
  }

  /**
   * @description This method is used to update data in the table.
   * @param {string} pKey
   * @param {{[key: string]: any}} dataToUpdate
   * @returns {Promise<any>}
   */
  updateWhere(pKey, dataToUpdate) {
    return new Promise((resolve, reject) => {
      this.fingersCrossed.then((db) => {
        this.selectFrom(pKey).then((fetchedData) => {
          const transaction = db.transaction([this.tableName], 'readwrite');
          const store = transaction.objectStore(this.tableName);
          const data = Object.assign(fetchedData, dataToUpdate);
          const save = store.put(data);
          save.onsuccess = function () {
            return resolve(data);
          };
          save.onerror = function () {
            return reject('Cannot update data');
          };
        });
      });
    });
  }

  /**
   * @description This method is used to delete data from the table.
   * @param {string} pKey
   * @returns {Promise<unknown>}
   */
  deleteWhere(pKey) {
    return new Promise((resolve, reject) => {
      this.fingersCrossed.then((db) => {
        const request = db.transaction([this.tableName], 'readwrite').objectStore(this.tableName).delete(pKey);
        request.onsuccess = function () {
          return resolve(pKey);
        };
        request.onerror = function () {
          return reject("Couldn't remove an item");
        };
      });
    });
  }
}

module.exports = {
  Model,
};
