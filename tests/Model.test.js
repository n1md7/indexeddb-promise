import Model from '../src/Model';
import { Database } from '../src';

describe('Model.insert method', function () {
  it('should throw on data verify when table is nullish', function () {
    const users = {
      name: 'users',
      primaryKey: {
        name: 'id',
        autoIncrement: true,
        unique: true,
      },
      indexes: {
        username: {
          unique: false,
          multiEntry: true,
        },
      },
      timestamps: true,
    };
    const database = new Database({
      version: 1,
      name: 'Todo-list',
      tables: [users],
    });
    const model = new Model(database.connection, null);
    model.insert({}).catch((error) => {
      expect(error.message).toBe('Tables should not be empty/undefined');
    });
  });

  it('should throw on data verify when autoIncrement=false and not provided in insert data', function () {
    const users = {
      name: 'users',
      primaryKey: {
        name: 'id',
        autoIncrement: false,
        unique: true,
      },
      indexes: {
        username: {
          unique: false,
          multiEntry: true,
        },
      },
      timestamps: true,
    };
    const database = new Database({
      version: 1,
      name: 'Todo-list',
      tables: [users],
    });
    const model = new Model(database.connection, users);
    model
      .insert({
        username: 'nimda',
      })
      .catch((error) => {
        expect(error.message).toBe('Either include primary key as well or set {autoincrement: true}.');
      });
  });

  it('should throw an error on transaction insert', function () {
    const connectionMock = jest.fn().mockResolvedValue({
      transaction: () => ({
        objectStore: () => ({
          add: () => ({
            onsuccess: () => {},
            onerror: () => {},
          }),
        }),
      }),
    });
    jest.spyOn(Database.prototype, 'connection', 'get').mockImplementation(connectionMock);

    const users = {
      name: 'users',
      primaryKey: {
        name: 'id',
        autoIncrement: true,
        unique: true,
      },
      indexes: {
        username: {
          unique: false,
          multiEntry: true,
        },
      },
      timestamps: true,
    };
    const database = new Database({
      version: 1,
      name: 'Todo-list',
      tables: [users],
    });
    const model = new Model(database.connection, users);
    model.insert({ username: 'nimda' }).then(() => {
      expect(connectionMock).toHaveBeenCalledTimes(1);
    });
  });
});

describe('openCursor', function () {
  it('should resolve cursor value', function () {
    const connectionMock = jest.fn().mockResolvedValue({
      transaction: () => ({
        objectStore: () => ({
          openCursor: () => ({
            onsuccess: () => {},
            onerror: () => {},
          }),
        }),
      }),
    });
    jest.spyOn(Database.prototype, 'connection', 'get').mockImplementation(connectionMock);

    const users = {
      name: 'users',
      primaryKey: {
        name: 'id',
        autoIncrement: true,
        unique: true,
      },
      indexes: {
        username: {
          unique: false,
          multiEntry: true,
        },
      },
      timestamps: true,
    };
    const database = new Database({
      version: 1,
      name: 'Todo-list',
      tables: [users],
    });
    const model = new Model(database.connection, users);
    model.openCursor().then(() => {
      expect(connectionMock).toHaveBeenCalledTimes(1);
    });
  });
});
