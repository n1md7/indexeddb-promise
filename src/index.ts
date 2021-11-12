import ArraySorter from './array-sorter';
import { Optional } from 'utility-types';

export type Config = {
  version: number;
  name: string;
  tables: {
    name: string;
    primaryKey: {
      name: string;
      autoIncrement: boolean;
      unique: boolean;
    };
    initData?: {
      [key: string]: IDBValidKey | IDBKeyRange;
    }[];
    indexes: {
      [key: string]: {
        unique?: boolean;
        multiEntry?: boolean;
      };
    };
    timestamps?: boolean;
  }[];
};
export type TimeStamps = {
  createdAt: number;
  updatedAt: number;
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

export class Database<DataType extends Optional<TimeStamps>> {
  protected readonly databaseName: string = 'DefaultDatabase';
  protected readonly tables: string[] = ['DefaultTable'];
  protected readonly databaseVersion: number = 1;
  protected readonly connection: Promise<IDBDatabase>;
  protected activeTableName: string = 'DefaultTable';
  protected activeTableDetails: Config['tables'][0];

  constructor(protected readonly config: Config) {
    if (Array.isArray(config)) {
      throw new Error('Config has to be an Object');
    }

    this.tables = config.tables?.map((table) => table.name);
    this.databaseName = config.name;
    this.databaseVersion = config.version;

    this.connection = new Promise((resolve, reject) => {
      if (!window || !('indexedDB' in window) || !('open' in window.indexedDB)) {
        return reject('Unsupported environment');
      }

      const request = window.indexedDB.open(this.databaseName, this.databaseVersion);
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

      request.onupgradeneeded = (event) => Database.onUpgradeNeeded(request.result, config, event.oldVersion);
    });
  }

  private static async onUpgradeNeeded(db: IDBDatabase, database: Config, oldVersion: number) {
    for await (const table of database.tables) {
      if ((oldVersion < database.version && oldVersion) || db.objectStoreNames.contains(table.name)) {
        db.deleteObjectStore(table.name);
        console.info(`DB version changed, removing table: ${table.name} for the fresh start`);
      }
      const store = db.createObjectStore(table.name, {
        keyPath: table.primaryKey?.name || 'id',
        autoIncrement: table.primaryKey?.autoIncrement || true,
      });

      for (const key in table.indexes) {
        if (key in table.indexes) {
          store.createIndex(key, key, {
            unique: !!table.indexes[key].unique,
            multiEntry: !!table.indexes[key].multiEntry,
          });
        }
      }

      for (const data of (table.initData || []).map((item) => ({
        ...item,
        ...(table.timestamps && {
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      }))) {
        store.add(await Database.verify(data, database));
      }
    }
  }

  /**
   * @description This method is used to get the indexes of the table, verify and return it.
   */
  private static async verify<T>(data: T, config: Config): Promise<T> {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(data);
      config.tables.forEach((table) => {
        if (table.primaryKey?.autoIncrement === false) {
          if (!keys.includes(table.primaryKey?.name)) {
            return reject('Either include primary key as well or set {autoincrement: true}.');
          }
        }
      });

      return resolve(data);
    });
  }

  public setTable(table: string) {
    if (!this.tables.includes(table)) {
      throw new Error(`Table ${table} does not exist`);
    }
    this.activeTableName = table;
    this.activeTableDetails = this.config.tables.find(({ name }) => name === this.activeTableName);

    return this;
  }

  /**
   * @description This method is used to insert data into the table.
   */
  public async insert(data: Partial<DataType>): Promise<Partial<DataType>> {
    return new Promise(async (resolve, reject) => {
      try {
        const verifiedInsertData: Partial<DataType> = {
          ...(await Database.verify<Partial<DataType>>(data, this.config)),
          // Adding timestamps when enabled
          ...(this.activeTableDetails.timestamps && {
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
        };
        this.connection.then((db) => {
          const request = db
            .transaction(this.tables, 'readwrite')
            .objectStore(this.activeTableName)
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
        const transaction = db.transaction(this.tables);
        const objectStore = transaction.objectStore(this.activeTableName);
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
        const transaction = db.transaction(this.tables);
        const objectStore = transaction.objectStore(this.activeTableName);
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
        const objectStore = db.transaction(this.tables).objectStore(this.activeTableName);
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
          const transaction = db.transaction(this.tables, 'readwrite');
          const store = transaction.objectStore(this.activeTableName);
          const data = Object.assign(fetchedData, dataToUpdate);
          if (this.activeTableDetails.timestamps) data.createdAt = Date.now();
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
        const transaction = db.transaction(this.tables, 'readwrite');
        const request = transaction.objectStore(this.activeTableName).delete(pKey);
        request.onsuccess = () => resolve(pKey);
        request.onerror = () => reject(request.error || "Couldn't remove an item");
      });
    });
  }

  static async removeDatabase(name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(name);
      request.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
      };
      request.onsuccess = () => resolve('Database has been removed');
      request.onerror = () => reject(request.error || "Couldn't remove database");
    });
  }
}
