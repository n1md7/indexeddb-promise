import { Model } from '../src';

describe('IndexedDB', () => {
  const ref = { i: 1 };
  beforeAll(() => jest.clearAllMocks());
  beforeEach(() => {
    ref.i++;
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should be defined', () => {
    expect(Model).toBeDefined();
  });

  it('should create store and verify methods', () => {
    const db = new Model({
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
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    });
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

    const db = new Model({
      version: 1,
      databaseName: `Test-db-0${ref.i}`,
      tableName: 'users',
      primaryKey: {
        name: 'username',
        autoIncrement: false,
        unique: true,
      },
      initData,
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    });
    const data = { username: 'michael', password: 'passwd' };
    db.insert(data).then((inserted) => {
      expect(inserted).toEqual(data);
      expect(db.selectAll()).resolves.toEqual(expect.arrayContaining(initData.concat(data)));
    });
  });

  it('should verify .selectByPk', () => {
    const db = new Model({
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
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    });
    expect(db.selectByPk('admin')).resolves.toEqual({ username: 'admin', password: 'admin123' });
  });

  it('should verify .selectAll', () => {
    const db = new Model({
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
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    });
    expect(db.selectAll()).resolves.toHaveLength(2);
  });

  it('should verify .selectByIndex', () => {
    const db = new Model({
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
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    });
    db.selectByIndex('username', 'admin').then((data) => {
      expect(data).toEqual({ username: 'admin', password: 'admin123' });
    });
  });

  it('should verify .select', async () => {
    const db = new Model({
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
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    });
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
    const db = new Model({
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
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    });
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
    const db = new Model({
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
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    });
    const deleted = await db.deleteByPk('admin');
    expect(deleted).toEqual('admin');
    expect(await db.selectByPk('admin')).toBeUndefined();
  });

  it('should verify config', () => {
    const config = {
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
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    };

    const db = new Model(config);
    expect(db.config).toEqual(config);
  });

  it('should throw Either include primary key as well or set {autoincrement: true}.', async () => {
    const users = new Model({
      version: 1,
      databaseName: `Test-db-0${ref.i}`,
      tableName: 'users',
      primaryKey: {
        name: 'username',
        autoIncrement: false,
        unique: false,
      },
      initData: [
        { password: 'passwd' }, //missing username and it should throw
      ],
      indexes: {},
    });

    try {
      await users.insert({ password: 'passwd' });
    } catch (e) {
      expect(e).toEqual('Either include primary key as well or set {autoincrement: true}.');
    }
  });

  it('should throw Unsupported environment', () => {
    jest.spyOn(window.indexedDB, 'open').mockImplementation(() => {
      throw new Error('Unsupported environment');
    });

    new Model({
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
      indexes: {
        username: { unique: true, multiEntry: false },
        password: { unique: false, multiEntry: false },
      },
    }).connection.catch((err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Unsupported environment');
    });
  });

  it('should throw Config has to be an Object', () => {
    jest.spyOn(window.indexedDB, 'open').mockImplementation(() => {
      throw new Error('Unsupported environment');
    });

    expect(() => {
      new Model([]);
    }).toThrow('Config has to be an Object');
  });
});
