declare module '@n1md7/indexeddb-promise' {
    export type Config = {
        version: number;
        databaseName: string;
        tableName: string;
        primaryKey: {
            name: string;
            autoIncrement: boolean;
            unique: boolean;
        };
        initData?: {
            [key: string]: any;
        }[];
        indexes: {
            [key: string]: {
                unique?: boolean;
                multiEntry?: boolean;
            };
        };
    };
    export type Item = string | number | boolean | null | undefined;
    export type ListItem = {[key: string]: Item} | Item;
    export class Model<DataType = {[key: string]: any}> {
        constructor(config: Config);
        tableName: string;
        fingersCrossed: Promise<IDBDatabase>;
        get config(): Config;
        /**
         * @description This method is used to get the indexes of the table, verify and return it.
         */
        verify(data: DataType): DataType;
        /**
         * @description This method is used to insert data into the table.
         */
        insert(data: DataType): Promise<DataType>;
        /**
         * @description This method is used to select data from the table by Primary key.
         */
        selectByPk(pKey: string): Promise<ListItem | undefined>;
        /**
         * @description This method is used to select data from the table by defined Index key.
         */
        selectByIndex(indexName: string, value: string): Promise<ListItem | undefined>;
        /**
         * @description This method is used to select all the data from the table.
         */
        selectAll(): Promise<ListItem[]>;
        /**
         * @description This method is used to select data from the table.
         */
        select(options: {
            where?: DataType | ((data: DataType[]) => DataType[]);
            limit?: number;
            orderByDESC?: boolean;
            sortBy?: string | string[];
        }): Promise<DataType[]|undefined|null>;
        /**
         * @description This method is used to update data in the table.
         */
        updateByPk(pKey: string, dataToUpdate: Partial<DataType>): Promise<DataType>;
        /**
         * @description This method is used to delete data from the table.
         */
        deleteByPk(pKey: string): Promise<string>;
    }
}
