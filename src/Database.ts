import { Optional } from 'utility-types';
import { ConfigType, TableType, TimeStampsType } from './types';
import Model from './Model';
import Joi from 'joi';
import { ConfigSchema } from './schema';
import IDBError from './IDBError';

export class Database {
  protected readonly databaseName: string = 'DefaultDatabase';
  protected readonly tables: string[] = ['DefaultTable'];
  protected readonly databaseVersion: number = 1;
  protected readonly connection: Promise<IDBDatabase>;

  constructor(protected readonly config: ConfigType) {
    if (Array.isArray(config)) {
      throw new IDBError(IDBError.compose('Config has to be an Object'));
    }

    const validated: Joi.ValidationResult = ConfigSchema.validate(config);
    if (validated.error) {
      throw new IDBError(validated.error.details);
    }
    this.config = validated.value;
    this.tables = this.config.tables?.map((table) => table.name);
    this.databaseName = this.config.name;
    this.databaseVersion = this.config.version;

    this.connection = new Promise((resolve, reject) => {
      if (!window || !('indexedDB' in window) || !('open' in window.indexedDB)) {
        return reject('Unsupported environment');
      }

      const request = window.indexedDB.open(this.databaseName, this.databaseVersion);
      request.onerror = () => reject(request.error);
      request.onsuccess = function () {
        const connection = request.result;
        connection.onversionchange = function () {
          console.info('Database version changed');
          console.info('Connection closed.');
          connection.close();
        };

        return resolve(connection);
      };

      request.onblocked = function () {
        request.result.close();
        console.error(request.error || 'Database blocked');
      };

      request.onupgradeneeded = (event) => Database.onUpgradeNeeded(request.result, this.config, event.oldVersion);
    });
  }

  /**
   * @description This method is used to get the indexes of the table, verify and return it.
   */
  public static verify<T>(data: T, tables: TableType[]): T {
    if (!tables.length) {
      throw new Error('Tables should not be empty/undefined');
    }
    const keys = Object.keys(data);
    tables.forEach((table) => {
      if (table.primaryKey?.autoIncrement === false) {
        if (!keys.includes(table.primaryKey?.name)) {
          throw new Error('Either include primary key as well or set {autoincrement: true}.');
        }
      }
    });
    return data;
  }

  public static async removeDatabase(name: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase(name);
      request.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
      };
      request.onsuccess = () => resolve('Database has been removed');
      request.onerror = () => reject(request.error || "Couldn't remove database");
    });
  }

  private static async onUpgradeNeeded(db: IDBDatabase, database: ConfigType, oldVersion: number) {
    for await (const table of database.tables) {
      if ((oldVersion < database.version && oldVersion) || db.objectStoreNames.contains(table.name)) {
        db.deleteObjectStore(table.name);
        console.info(`DB version changed, removing table: ${table.name} for the fresh start`);
      }
      const store = db.createObjectStore(table.name, {
        keyPath: table.primaryKey?.name || 'id',
        autoIncrement: table.primaryKey?.autoIncrement || true,
      });

      Database.createIndexes(store, table.indexes);
      Database.insertInitialValues(store, table);
    }
  }

  private static createIndexes(store: IDBObjectStore, indexes: TableType['indexes']): void {
    for (const key in indexes) {
      if (key in indexes) {
        store.createIndex(key, key, {
          unique: !!indexes[key].unique,
          multiEntry: !!indexes[key].multiEntry,
        });
      }
    }
  }

  private static insertInitialValues(store: IDBObjectStore, table: TableType): void {
    for (const data of (table.initData || []).map((item) => ({
      ...item,
      ...(table.timestamps && {
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    }))) {
      store.add(Database.verify(data, [table]));
    }
  }

  public useModel<CollectionType extends Optional<TimeStampsType>>(tableName: string) {
    if (!this.tables.includes(tableName)) {
      throw new Error(`Table [${tableName}] does not exist`);
    }
    const table = this.config.tables.find(({ name }) => name === tableName);

    return new Model<CollectionType>(this.connection, table);
  }
}
