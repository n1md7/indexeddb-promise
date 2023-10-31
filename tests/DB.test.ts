import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Database, PrimaryKey, Table } from '../src';

describe('Database', function () {
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

    await expect(db.connect()).rejects.toBe('Unsupported environment');

    // restore the global window object
    window = ref.window;
  });
});
