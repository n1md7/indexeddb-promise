import ArraySorter from './array-sorter';
import { Optional } from 'utility-types';
import { Database } from './Database';
import { OptionsType, OptionsWhereAsObject, TableType, TimeStampsType } from './types';

export default class Model<DataType extends Optional<TimeStampsType>> {
  constructor(private readonly connection: Promise<IDBDatabase>, private readonly table: TableType) {}

  /**
   * @description This method is used to insert data into the table.
   */
  public async insert(data: Partial<DataType>): Promise<Partial<DataType>> {
    return new Promise((resolve, reject) => {
      try {
        const verifiedInsertData: Partial<DataType> = {
          ...Database.verify<Partial<DataType>>(data, [this.table]),
          // Adding timestamps when enabled
          ...(this.table.timestamps && {
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }),
        };
        this.connection.then((db) => {
          const request = db
            .transaction(this.table.name, 'readwrite')
            .objectStore(this.table.name)
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
        const transaction = db.transaction(this.table.name, 'readonly');
        const objectStore = transaction.objectStore(this.table.name);
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
        const transaction = db.transaction(this.table.name, 'readonly');
        const objectStore = transaction.objectStore(this.table.name);
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
        const objectStore = db.transaction(this.table.name, 'readonly').objectStore(this.table.name);
        const request = objectStore.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || "Can't get data from database");
      });
    });
  }

  public async openCursor(): Promise<IDBRequest<IDBCursorWithValue> | undefined> {
    return new Promise((resolve, reject) => {
      this.connection.then((db) => {
        const objectStore = db.transaction(this.table.name, 'readonly').objectStore(this.table.name);
        const request = objectStore.openCursor();
        request.onsuccess = () => resolve(request);
        request.onerror = () => reject(request.error || "Can't get data from database");
      });
    });
  }

  /**
   * @description This method is used to select data from the table.
   */
  public async select(options: OptionsType<DataType>): Promise<DataType[] | undefined> {
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
          const transaction = db.transaction(this.table.name, 'readwrite');
          const store = transaction.objectStore(this.table.name);
          const data = Object.assign(fetchedData, dataToUpdate);
          if (this.table.timestamps) data.createdAt = Date.now();
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
        const transaction = db.transaction(this.table.name, 'readwrite');
        const request = transaction.objectStore(this.table.name).delete(pKey);
        request.onsuccess = () => resolve(pKey);
        request.onerror = () => reject(request.error || "Couldn't remove an item");
      });
    });
  }
}
