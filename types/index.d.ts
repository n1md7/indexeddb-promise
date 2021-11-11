export declare type Config = {
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
declare type OptionsWhereAsCallback<I> = (list: I[]) => Partial<I>[];
declare type OptionsWhereAsObject<T extends keyof any = any> = {
  [key in T]: IDBValidKey | IDBKeyRange;
};
export declare type Options<I, T extends keyof any = any> = {
  where?: OptionsWhereAsObject<T> | OptionsWhereAsCallback<I>;
  limit?: number;
  orderByDESC?: boolean;
  sortBy?: keyof I | keyof I[];
};
export default class Model<DataType extends any> {
  protected readonly config: Config;
  protected readonly databaseName: string;
  protected readonly tableName: string;
  protected readonly version: number;
  protected readonly connection: Promise<IDBDatabase>;
  constructor(config: Config);
  private static onUpgradeNeeded;
  /**
   * @description This method is used to get the indexes of the table, verify and return it.
   */
  private static verify;
  /**
   * @description This method is used to insert data into the table.
   */
  insert(data: Partial<DataType>): Promise<Partial<DataType>>;
  /**
   * @description This method is used to select data from the table by Primary key.
   */
  selectByPk(pKey: IDBValidKey | IDBKeyRange): Promise<DataType | undefined>;
  /**
   * @description This method is used to select data from the table by defined Index key.
   */
  selectByIndex(indexName: string, value: IDBValidKey | IDBKeyRange): Promise<DataType | undefined>;
  /**
   * @description This method is used to select all the data from the table.
   */
  selectAll(): Promise<DataType[] | undefined>;
  /**
   * @description This method is used to select data from the table.
   */
  select(options: Options<DataType>): Promise<DataType[] | undefined>;
  /**
   * @description This method is used to update data in the table by primary key.
   * It combines original and updateData and the same keys will be overridden.
   */
  updateByPk(pKey: string | number, dataToUpdate: Partial<DataType>): Promise<DataType | undefined>;
  /**
   * @description This method is used to delete data from the table.
   */
  deleteByPk(pKey: string | number): Promise<string | number | undefined>;
}
export {};
