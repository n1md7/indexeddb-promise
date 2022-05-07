import { Database, Indexed, PrimaryKey, Table } from '../src';

describe('Database', function () {
  beforeAll(() => jest.clearAllMocks());
  afterEach(() => jest.clearAllTimers());

  it('should throw config error "Config has to be an Object"', (done) => {
    expect(() => {
      new Database();
    }).toThrowError('Config.tables has to be an Array');
    done();
  });

  it('should throw when "verify" method is lacking primary key value in insert data', function () {
    try {
      Database.verify(
        {
          username: 'test',
          password: 'test',
        },
        [
          {
            name: 'users',
            primaryKey: {
              name: 'id',
              autoIncrement: false,
              unique: true,
            },
            indexes: {
              username: { unique: true, multiEntry: false },
              password: { unique: false, multiEntry: false },
            },
          },
        ],
      );
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe('Either include primary key as well or set {autoincrement: true}.');
    }
  });

  it('should throw config validation errors', (done) => {
    expect(() => {
      new Database({
        version: 1,
        name: 'table',
        tables: [{}],
      });
    }).toThrowError();
    expect(() => {
      new Database({
        version: 1,
        name: 'table',
        tables: [null],
      });
    }).toThrowError();

    expect(() => {
      new Database({
        version: 1,
        name: 'table',
        tables: null,
      });
    }).toThrowError();
    expect(() => {
      new Database({
        version: 1,
        name: 'table',
        tables: [
          {
            name: 'table',
            unknown: 'filed',
          },
        ],
      });
    }).toThrowError();
    expect(() => {
      new Database({
        version: 1,
        anotherUnknownField: 'table',
        name: 'table',
        tables: [
          {
            name: 'table',
            unknown: 'filed',
          },
        ],
      });
    }).toThrowError();
    expect(() => {
      new Database({
        version: 1,
        name: 'table',
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
          {
            bad: 'type',
          },
        ],
      });
    }).toThrowError();

    expect(() => {
      new Database({
        version: 1,
        name: 'table',
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
          {
            name: 'Products',
            primaryKey: {
              unique: true,
              bad: 'key',
            },
          },
        ],
      });
    }).toThrowError();

    expect(() => {
      new Database({
        version: 1,
        name: 'table',
        tables: ['wrong-table-type'],
      });
    }).toThrowError('Config.tables has to be an Array of Objects or Annotated Classes');
    done();
  });

  it('should check metadata and serialize config correctly with no timestamps', function () {
    class Users {}
    Table()(Users);
    PrimaryKey()(new Users(), '__id__');
    Indexed()(new Users(), 'name');
    Indexed()(new Users(), 'email');

    const db = new Database({
      version: 1,
      name: 'BadassDB',
      tables: [Users],
    });

    expect(db.configuration).toEqual({
      version: 1,
      name: 'BadassDB',
      tables: [
        {
          name: 'Users',
          timestamps: false,
          primaryKey: {
            name: '__id__',
            autoIncrement: true,
            unique: true,
          },
          indexes: {
            name: {
              multiEntry: true,
              unique: false,
            },
            email: {
              multiEntry: true,
              unique: false,
            },
          },
          initData: [],
        },
      ],
    });
  });

  it('should check metadata and serialize config correctly with timestamps', function () {
    class Users {}
    Table({ name: 'OverrideName', timestamps: true })(Users);
    PrimaryKey({ autoIncrement: false })(new Users(), '__id__');
    Indexed({ unique: true })(new Users(), 'name');
    Indexed()(new Users(), 'email');

    const db = new Database({
      version: 1,
      name: 'BadassDB',
      tables: [Users],
    });

    expect(db.configuration).toEqual({
      version: 1,
      name: 'BadassDB',
      tables: [
        {
          name: 'OverrideName',
          timestamps: true,
          primaryKey: {
            name: '__id__',
            autoIncrement: false,
            unique: true,
          },
          indexes: {
            name: {
              multiEntry: true,
              unique: true,
            },
            email: {
              multiEntry: true,
              unique: false,
            },
          },
          initData: [],
        },
      ],
    });
  });

  it('should check and verify when config is no metadata type', function () {
    const db = new Database({
      version: 999,
      name: 'table',
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
        {
          name: 'Products',
          primaryKey: {
            unique: true,
          },
        },
      ],
    });

    expect(db.configuration).toEqual({
      version: 999,
      name: 'table',
      tables: [
        {
          name: 'users',
          primaryKey: {
            name: 'username',
            autoIncrement: false,
            unique: true,
          },
          initData: [
            {
              username: 'n1md7',
              password: 'passwd',
            },
            {
              username: 'admin',
              password: 'admin123',
            },
          ],
          indexes: {
            username: {
              unique: true,
              multiEntry: false,
            },
            password: {
              unique: false,
              multiEntry: false,
            },
          },
          timestamps: false,
        },
        {
          // Defaulted to these values below
          name: 'Products',
          primaryKey: {
            unique: true,
            name: 'id',
            autoIncrement: true,
          },
          indexes: {},
          timestamps: false,
          initData: [],
        },
      ],
    });
  });
});
