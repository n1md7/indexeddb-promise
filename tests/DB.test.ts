import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Database, PrimaryKey, Table } from '../src';

describe('Database', function () {
  beforeAll(() => jest.clearAllMocks());
  beforeEach(() => jest.clearAllMocks());

  it('should throw Unsupported environment: mocked', () => {
    jest.spyOn(window.indexedDB, 'open').mockImplementation(() => {
      throw new Error('Unsupported environment');
    });

    new Database({
      version: 1,
      name: `Test-db-000`,
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
    })
      .connect()
      .catch((err) => {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Unsupported environment');
      });
  });

  it('unsupported environment', async function () {
    const ref = { window };
    // @ts-ignore
    delete window.indexedDB;

    @Table()
    class User {
      @PrimaryKey({ autoIncrement: true, unique: true })
      id: number;
    }

    const db = new Database({
      version: 1,
      name: 'Store-01',
      tables: [User],
    });

    try {
      await db.connect();
    } catch (message) {
      expect(message).toBe('Unsupported environment');
    }

    // restore the global window object
    window = ref.window;
  });
});
