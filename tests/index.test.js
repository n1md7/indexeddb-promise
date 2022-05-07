import { Database } from '../src';

function* id() {
  for (let i = 0; i < 128; i++) yield String(i).padStart(2, '0');
}

describe('IndexedDB', () => {
  beforeAll(() => jest.clearAllMocks());
  beforeEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(Database).toBeDefined();
  });

  it('should create store and verify methods', async () => {
    const db = new Database({
      version: 1,
      name: `Test-db${id().next().value}`,
      tables: [
        {
          name: 'users',
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
        },
      ],
    });
    await db.connect();
    const table = db.useModel('users');
    expect(table.insert).toBeDefined();
    expect(table.selectAll).toBeDefined();
    expect(table.selectByPk).toBeDefined();
    expect(table.select).toBeDefined();
    expect(table.deleteByPk).toBeDefined();
    expect(table.updateByPk).toBeDefined();
  });

  it('should insert and verify data', (done) => {
    const initData = [
      { username: 'n1md7', password: 'passwd' },
      { username: 'admin', password: 'admin123' },
    ];
    const db = new Database({
      version: 1,
      name: `Test-db${id().next().value}`,
      tables: [
        {
          name: 'users',
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
        },
      ],
    });
    db.connect().then(() => {
      const data = { username: 'michael', password: 'passwd' };
      const table = db.useModel('users');
      table.insert(data).then((inserted) => {
        // expect(inserted).toEqual(data);
        table.selectAll().then((all) => {
          expect(all).toEqual(expect.arrayContaining(initData.concat(data)));
          done();
        });
      });
    });
  });

  it('should verify .selectByPk', (done) => {
    const db = new Database({
      version: 1,
      name: `Test-db${id().next().value}`,
      tables: [
        {
          name: 'users',
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
        },
      ],
    });
    db.connect().then(() => {
      const model = db.useModel('users');
      model.selectByPk('admin').then((selected) => {
        expect(selected).toEqual({ username: 'admin', password: 'admin123' });
        done();
      });
    });
  });

  it('should verify .selectAll', async () => {
    const db = new Database({
      version: 1,
      name: `Test-db${id().next().value}`,
      tables: [
        {
          name: 'users',
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
        },
      ],
    });
    await db.connect();
    const _data = await db.useModel('users').selectAll();
    expect(_data).not.toBeNull();
  });

  it('should verify .selectByIndex', async () => {
    const db = new Database({
      version: 1,
      name: `Test-db${id().next().value}`,
      tables: [
        {
          name: 'users',
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
        },
      ],
    });
    await db.connect();
    const model = db.useModel('users');
    model.selectByIndex('username', 'admin').then((data) => {
      expect(data).toEqual({ username: 'admin', password: 'admin123' });
    });
  });

  it('should verify .select', async () => {
    const db = new Database({
      version: 1,
      name: `Test-db${id().next().value}`,
      tables: [
        {
          name: 'users',
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
        },
      ],
    });
    await db.connect();
    const model = db.useModel('users');
    expect(
      await model.select({
        where: {
          password: 'admin123',
        },
      }),
    ).toEqual([{ username: 'admin', password: 'admin123' }]);
    expect(
      await model.select({
        where: {
          username: 'admin',
        },
      }),
    ).toEqual([{ username: 'admin', password: 'admin123' }]);
    expect(
      await model.select({
        where: {
          username: 'admin',
          password: 'admin123',
        },
      }),
    ).toEqual([{ username: 'admin', password: 'admin123' }]);
    expect(
      await model.select({
        where: (data) => data,
      }),
    ).toEqual(
      expect.arrayContaining([
        { username: 'n1md7', password: 'passwd' },
        { username: 'admin', password: 'admin123' },
      ]),
    );
    expect(
      await model.select({
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
      await model.select({
        where: (data) => data,
        sortBy: 'username',
        limit: 1,
      }),
    ).toEqual(expect.arrayContaining([{ username: 'admin', password: 'admin123' }]));
    expect(
      await model.select({
        where: (data) => data,
        sortBy: 'username',
        limit: 1,
        orderByDESC: true,
      }),
    ).toEqual(expect.arrayContaining([{ username: 'n1md7', password: 'passwd' }]));
  });

  it('should verify .updateByPk', async () => {
    const db = new Database({
      version: 1,
      name: `Test-db${id().next().value}`,
      tables: [
        {
          name: 'users',
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
        },
      ],
    });
    await db.connect();
    const model = db.useModel('users');
    const update = await model.updateByPk('admin', {
      password: 'strongerPassword',
    });
    expect(update).toEqual({ username: 'admin', password: 'strongerPassword' });
    expect(await model.selectByPk('admin')).toEqual({
      password: 'strongerPassword',
      username: 'admin',
    });
  });

  it('should verify .deleteByPk', async () => {
    const db = new Database({
      version: 1,
      name: `Test-db${id().next().value}`,
      tables: [
        {
          name: 'users',
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
        },
      ],
    });
    await db.connect();
    const model = db.useModel('users');
    const deleted = await model.deleteByPk('admin');
    expect(deleted).toEqual('admin');
    expect(await model.selectByPk('admin')).toBeUndefined();
  });

  it('should verify config', () => {
    const config = {
      version: 1,
      name: `Test-db${id().next().value}`,
      tables: [
        {
          name: 'users',
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
          timestamps: false,
        },
      ],
    };
    const db = new Database(config);
    expect(db.config).toEqual(config);
  });

  it('should throw Config has to be an Object', () => {
    jest.spyOn(window.indexedDB, 'open').mockImplementation(() => {
      throw new Error('Unsupported environment');
    });

    expect(() => {
      new Database([]);
    }).toThrow('Config has to be an Object');
  });
});
