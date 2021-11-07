const IndexedDB = require('../src');
const { describe, it, expect, beforeEach } = require('@jest/globals');

describe('IndexedDB', () => {
  const ref = { i: 1 };
  beforeAll(() => jest.clearAllMocks());
  beforeEach(() => {
    ref.i++;
  });

  it('should be defined', () => {
    expect(IndexedDB).toBeDefined();
  });

  it('should create store and verify methods', () => {
    class DB extends IndexedDB.Model {
      get config() {
        return {
          version: 1,
          databaseName: `Test-db-0${ref.i}`,
          tableName: 'users',
          primaryKey: {
            name: 'username',
            autoIncrement: false,
            unique: true,
          },
          initData: [
            { username: 'n1md7', password: 'passwd' },
            { username: 'admin', password: 'admin123' },
          ],
          structure: {
            username: { unique: true, multiEntry: false },
            password: { unique: false, multiEntry: false },
          },
        };
      }
    }

    const db = new DB();
    expect(db.config).toBeDefined();
    expect(db.fingersCrossed).toBeDefined();
    expect(db.tableName).toBeDefined();
    expect(db.verify).toBeDefined();
    expect(db.insert).toBeDefined();
    expect(db.selectAll).toBeDefined();
    expect(db.selectByPk).toBeDefined();
    expect(db.select).toBeDefined();
    expect(db.deleteByPk).toBeDefined();
    expect(db.updateByPk).toBeDefined();
  });

  it('should insert and verify data', () => {
    const initData = [
      { username: 'n1md7', password: 'passwd' },
      { username: 'admin', password: 'admin123' },
    ];

    class DB extends IndexedDB.Model {
      get config() {
        return {
          version: 1,
          databaseName: `Test-db-0${ref.i}`,
          tableName: 'users',
          primaryKey: {
            name: 'username',
            autoIncrement: false,
            unique: true,
          },
          initData,
          structure: {
            username: { unique: true, multiEntry: false },
            password: { unique: false, multiEntry: false },
          },
        };
      }
    }

    const db = new DB();
    const data = { username: 'michael', password: 'passwd' };
    db.insert(data).then((inserted) => {
      expect(inserted).toEqual(data);
      expect(db.selectAll()).resolves.toEqual(expect.arrayContaining(initData.concat(data)));
    });
  });

  it('should verify .selectByPk', () => {
    class DB extends IndexedDB.Model {
      get config() {
        return {
          version: 1,
          databaseName: `Test-db-0${ref.i}`,
          tableName: 'users',
          primaryKey: {
            name: 'username',
            autoIncrement: false,
            unique: true,
          },
          initData: [
            { username: 'n1md7', password: 'passwd' },
            { username: 'admin', password: 'admin123' },
          ],
          structure: {
            username: { unique: true, multiEntry: false },
            password: { unique: false, multiEntry: false },
          },
        };
      }
    }

    const db = new DB();
    expect(db.selectByPk('admin')).resolves.toEqual({ username: 'admin', password: 'admin123' });
  });

  it('should verify .selectAll', () => {
    class DB extends IndexedDB.Model {
      get config() {
        return {
          version: 1,
          databaseName: `Test-db-0${ref.i}`,
          tableName: 'users',
          primaryKey: {
            name: 'username',
            autoIncrement: false,
            unique: true,
          },
          initData: [
            { username: 'n1md7', password: 'passwd' },
            { username: 'admin', password: 'admin123' },
          ],
          structure: {
            username: { unique: true, multiEntry: false },
            password: { unique: false, multiEntry: false },
          },
        };
      }
    }

    const db = new DB();
    expect(db.selectAll()).resolves.toHaveLength(2);
  });

  it('should verify .select', async () => {
    class DB extends IndexedDB.Model {
      get config() {
        return {
          version: 1,
          databaseName: `Test-db-0${ref.i}`,
          tableName: 'users',
          primaryKey: {
            name: 'username',
            autoIncrement: false,
            unique: true,
          },
          initData: [
            { username: 'n1md7', password: 'passwd' },
            { username: 'admin', password: 'admin123' },
          ],
          structure: {
            username: { unique: true, multiEntry: false },
            password: { unique: false, multiEntry: false },
          },
        };
      }
    }

    const db = new DB();
    expect(
      await db.select({
        where: {
          password: 'admin123',
        },
      }),
    ).toEqual([{ username: 'admin', password: 'admin123' }]);
    expect(
      await db.select({
        where: {
          username: 'admin',
        },
      }),
    ).toEqual([{ username: 'admin', password: 'admin123' }]);
    expect(
      await db.select({
        where: {
          username: 'admin',
          password: 'admin123',
        },
      }),
    ).toEqual([{ username: 'admin', password: 'admin123' }]);
    expect(
      await db.select({
        where: (data) => data,
      }),
    ).toEqual(
      expect.arrayContaining([
        { username: 'n1md7', password: 'passwd' },
        { username: 'admin', password: 'admin123' },
      ]),
    );
    expect(
      await db.select({
        where: (data) => data,
        sortBy: 'username',
      }),
    ).toEqual(
      expect.arrayContaining([
        { username: 'admin', password: 'admin123' },
        { username: 'n1md7', password: 'passwd' },
      ]),
    );
    expect(
      await db.select({
        where: (data) => data,
        sortBy: 'username',
        limit: 1,
      }),
    ).toEqual(expect.arrayContaining([{ username: 'admin', password: 'admin123' }]));
    expect(
      await db.select({
        where: (data) => data,
        sortBy: 'username',
        limit: 1,
        orderByDESC: true,
      }),
    ).toEqual(expect.arrayContaining([{ username: 'n1md7', password: 'passwd' }]));
  });

  it('should verify .updateByPk', async () => {
    class DB extends IndexedDB.Model {
      get config() {
        return {
          version: 1,
          databaseName: `Test-db-0${ref.i}`,
          tableName: 'users',
          primaryKey: {
            name: 'username',
            autoIncrement: false,
            unique: true,
          },
          initData: [
            { username: 'n1md7', password: 'passwd' },
            { username: 'admin', password: 'admin123' },
          ],
          structure: {
            username: { unique: true, multiEntry: false },
            password: { unique: false, multiEntry: false },
          },
        };
      }
    }

    const db = new DB();
    const update = await db.updateByPk('admin', {
      password: 'strongerPassword',
    });
    expect(update).toEqual({ username: 'admin', password: 'strongerPassword' });
    expect(await db.selectByPk('admin')).toEqual({
      password: 'strongerPassword',
      username: 'admin',
    });
  });

  it('should verify .deleteByPk', async () => {
    class DB extends IndexedDB.Model {
      get config() {
        return {
          version: 1,
          databaseName: `Test-db-0${ref.i}`,
          tableName: 'users',
          primaryKey: {
            name: 'username',
            autoIncrement: false,
            unique: true,
          },
          initData: [
            { username: 'n1md7', password: 'passwd' },
            { username: 'admin', password: 'admin123' },
          ],
          structure: {
            username: { unique: true, multiEntry: false },
            password: { unique: false, multiEntry: false },
          },
        };
      }
    }

    const db = new DB();
    const deleted = await db.deleteByPk('admin');
    expect(deleted).toEqual('admin');
    expect(await db.selectByPk('admin')).toBeNull();
  });
});
