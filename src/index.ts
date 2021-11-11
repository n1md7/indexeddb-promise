import ArraySorter from './array-sorter';

export type Config = {
  version: number;
  databaseName: string;
  tableName: string;
  primaryKey: {
    name: string;
    autoIncrement: boolean;
    unique: boolean;
  };
  initData?: Array<{
    [key: string]: IDBValidKey | IDBKeyRange;
  }>;
  indexes: {
    [key: string]: {
      unique?: boolean;
      multiEntry?: boolean;
    };
  };
};

type OptionsWhereAsCallback<I> = (list: I[]) => Partial<I>[];
type OptionsWhereAsObject<T extends keyof any = any> = {
  [key in T]: IDBValidKey | IDBKeyRange;
};
export type Options<I, T extends keyof any = any> = {
  where?: OptionsWhereAsObject<T> | OptionsWhereAsCallback<I>;
  limit?: number;
  orderByDESC?: boolean;
  sortBy?: keyof I | keyof I[];
};

export class Model<DataType extends any> {
  protected readonly databaseName: string = 'DefaultDatabase';
  protected readonly tableName: string = 'DefaultTable';
  protected readonly version: number = 1;
  protected readonly connection: Promise<IDBDatabase>;

  constructor(protected readonly config: Config) {
    this.tableName = this.config.tableName;
    this.databaseName = this.config.databaseName;
    this.version = this.config.version;

    if (Array.isArray(this.config)) {
      throw new Error('Config has to be an Object');
    }

    this.connection = new Promise((resolve, reject) => {
      if (!window || !('indexedDB' in window) || !('open' in window.indexedDB)) {
        return reject('Unsupported environment');
      }

      const request = window.indexedDB.open(this.databaseName, this.version);
      request.onerror = () => reject(request.error);
      request.onsuccess = function () {
        const connection = request.result;
        connection.onversionchange = function () {
          connection.close();
          console.info('connection closed...');
        };

        return resolve(connection);
      };

      request.onblocked = function () {
        request.result.close();
        console.error(request.error || 'Database blocked');
      };

      request.onupgradeneeded = (event) => Model.onUpgradeNeeded(request.result, this.config, event.oldVersion);
    });
  }

  private static async onUpgradeNeeded(db: IDBDatabase, config: Config, oldVersion: number) {
    if ((oldVersion < config.version && oldVersion) || db.objectStoreNames.contains(config.tableName)) {
      db.deleteObjectStore(config.tableName);
      console.info(`DB version changed, removing table: ${config.tableName} for the fresh start`);
    }
    const store = db.createObjectStore(config.tableName, {
      keyPath: config.primaryKey?.name || 'id',
      autoIncrement: config.primaryKey?.autoIncrement || true,
    });

    for (const key in config.indexes) {
      if (Reflect.has(config.indexes, key)) {
        store.createIndex(key, key, {
          unique: !!config.indexes[key].unique,
          multiEntry: !!config.indexes[key].multiEntry,
        });
      }
    }

    for (const data of config.initData || []) {
      store.add(await Model.verify(data, config));
    }
  }

  /**
   * @description This method is used to get the indexes of the table, verify and return it.
   */
  private static async verify<T>(data: T, config: Config): Promise<T> {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(data);
      if (config.primaryKey?.autoIncrement === false) {
        if (!keys.includes(config.primaryKey?.name)) {
          return reject('Either include primary key as well or set {autoincrement: true}.');
        }
      }

      return resolve(data);
    });
  }

  /**
   * @description This method is used to insert data into the table.
   */
  public async insert(data: Partial<DataType>): Promise<Partial<DataType>> {
    return new Promise(async (resolve, reject) => {
      try {
        const verifiedInsertData: Partial<DataType> = await Model.verify<Partial<DataType>>(data, this.config);
        this.connection.then((db) => {
          const request = db
            .transaction([this.tableName], 'readwrite')
            .objectStore(this.tableName)
            .add(verifiedInsertData);
          request.onsuccess = () => resolve(data);
          request.onerror = () => reject(request.error || 'Unable to add data. Check the unique values');
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * @description This method is used to select data from the table by Primary key.
   */
  public async selectByPk(pKey: IDBValidKey | IDBKeyRange): Promise<DataType | undefined> {
    return new Promise((resolve, reject) => {
      this.connection.then((db) => {
        const transaction = db.transaction([this.tableName]);
        const objectStore = transaction.objectStore(this.tableName);
        const request = objectStore.get(pKey);
        request.onerror = () => reject(request.error || 'Unable to retrieve data from the model');
        request.onsuccess = () => resolve(request.result);
      });
    });
  }

  /**
   * @description This method is used to select data from the table by defined Index key.
   */
  public async selectByIndex(indexName: string, value: IDBValidKey | IDBKeyRange): Promise<DataType | undefined> {
    return new Promise((resolve, reject) => {
      this.connection.then((db) => {
        const transaction = db.transaction([this.tableName]);
        const objectStore = transaction.objectStore(this.tableName);
        const request = objectStore.index(indexName).get(value);
        request.onerror = () => reject(request.error || `Unable to retrieve data from the model by ${indexName}`);
        request.onsuccess = () => resolve(request.result);
      });
    });
  }

  /**
   * @description This method is used to select all the data from the table.
   */
  public async selectAll(): Promise<DataType[] | undefined> {
    return new Promise((resolve, reject) => {
      this.connection.then((db) => {
        const objectStore = db.transaction(this.tableName).objectStore(this.tableName);
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || "Can't get data from database");
      });
    });
  }

  /**
   * @description This method is used to select data from the table.
   */
  public async select(options: Options<DataType>): Promise<DataType[] | undefined> {
    return this.selectAll().then((data) => {
      let result: DataType[] = [];
      if (Reflect.has(options, 'where') && options.where) {
        if (!data) return [];

        if (typeof options.where === 'function') {
          result = (options.where as Function)(data);
        } else {
          const whereKeys = Object.keys(options.where);
          result = data.filter((item) => {
            const dataKeys = Object.keys(item);
            for (const key of whereKeys) {
              if (dataKeys.includes(key) && (item as any)[key] === (options.where as OptionsWhereAsObject)[key]) {
                return true;
              }
            }
            return false;
          });
        }
      }

      if (Reflect.has(options, 'sortBy') && options.sortBy) {
        // sort data
        result = new ArraySorter<DataType>(result).sortBy({
          desc: Reflect.has(options, 'orderByDESC') && options.orderByDESC,
          keys: [options.sortBy as string],
        });
      }

      if (Reflect.has(options, 'limit') && options.limit) {
        // slice data
        result = result.slice(0, +options.limit);
      }

      return result;
    });
  }

  /**
   * @description This method is used to update data in the table by primary key.
   * It combines original and updateData and the same keys will be overridden.
   */
  updateByPk(pKey: IDBValidKey | IDBKeyRange, dataToUpdate: Partial<DataType>): Promise<DataType | undefined> {
    return new Promise((resolve, reject) => {
      this.connection.then((db) => {
        this.selectByPk(pKey).then((fetchedData) => {
          const transaction = db.transaction([this.tableName], 'readwrite');
          const store = transaction.objectStore(this.tableName);
          const data = Object.assign(fetchedData, dataToUpdate);
          const save = store.put(data);
          save.onsuccess = () => resolve(data);
          save.onerror = () => reject(save.error || "Couldn't update data");
        });
      });
    });
  }

  /**
   * @description This method is used to delete data from the table.
   */
  deleteByPk(pKey: IDBValidKey | IDBKeyRange): Promise<IDBValidKey | IDBKeyRange | undefined> {
    return new Promise((resolve, reject) => {
      this.connection.then((db) => {
        const transaction = db.transaction([this.tableName], 'readwrite');
        const request = transaction.objectStore(this.tableName).delete(pKey);
        request.onsuccess = () => resolve(pKey);
        request.onerror = () => reject(request.error || "Couldn't remove an item");
      });
    });
  }
}
