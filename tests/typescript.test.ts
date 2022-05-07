import { describe, expect, it, beforeAll, beforeEach, jest } from '@jest/globals';
import { Database, Indexed, PrimaryKey, Table } from '../src';

describe('Typescript', function () {
  beforeAll(() => jest.clearAllMocks());
  beforeEach(() => jest.clearAllMocks());

  it('should work', async function () {
    @Table({ timestamps: true })
    class User {
      @PrimaryKey({ autoIncrement: true, unique: true })
      id: number;

      @Indexed({ unique: true, multiEntry: false })
      username: string;

      @Indexed()
      password: string;

      toString() {
        return `#${this.id} ${this.username}`;
      }
    }

    @Table()
    class Info {
      @PrimaryKey({ autoIncrement: true, unique: true })
      id: number;

      @Indexed()
      userId: number;

      name: {
        first: string;
        last: string;
      };

      age: number;

      occupation: string;

      toString() {
        return `${this.name.first} ${this.name.last} ${this.age} years old - ${this.occupation}`;
      }
    }

    const store = new Database({
      version: 1,
      name: 'Store',
      tables: [User, Info],
    });

    await store.connect();

    const userModel = store.useModel(User);
    const infoModel = store.useModel(Info);

    const savedUser = await userModel.insert({
      username: 'admin',
      password: 'admin',
    });

    expect(savedUser).toEqual({
      id: expect.any(Number),
      username: 'admin',
      password: 'admin',
    });

    await infoModel.insert({
      userId: savedUser.id,
      name: {
        first: 'John',
        last: 'Doe',
      },
      age: 27,
      occupation: 'Web Developer',
    });

    const user = await userModel.selectByIndex('username', 'admin');
    expect(user).toBeInstanceOf(User);
    expect(user).toEqual({
      id: expect.any(Number),
      username: 'admin',
      password: 'admin',
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });
    expect(user.toString()).toBe('#1 admin');

    const [info] = await infoModel.select({ where: { userId: user.id } });
    expect(info).toBeInstanceOf(Info);
    expect(info).toEqual({
      id: expect.any(Number),
      userId: user.id,
      name: {
        first: 'John',
        last: 'Doe',
      },
      age: 27,
      occupation: 'Web Developer',
    });
    expect(info.toString()).toBe('John Doe 27 years old - Web Developer');
  });

  it('models selectByPk', async function () {
    @Table()
    class User {
      @PrimaryKey({ autoIncrement: true, unique: true })
      id: number;

      @Indexed({ unique: true, multiEntry: false })
      username: string;

      @Indexed()
      password: string;

      toString() {
        return `#${this.id} ${this.username}`;
      }
    }

    const store = new Database({
      version: 1,
      name: 'Store-01',
      tables: [User],
    });

    await store.connect();

    const userModel = store.useModel(User);
    const savedUser = await userModel.insert({
      username: 'admin',
      password: 'admin',
    });
    const fetchedUserByPk = await userModel.selectByPk(savedUser.id);
    const fetchedUserByIndex = await userModel.selectByIndex('username', 'admin');
    const [fetchedUser] = await userModel.select({ where: { username: 'admin' } });
    expect(fetchedUserByPk).toEqual(fetchedUserByIndex);
    expect(fetchedUserByPk).toEqual(fetchedUser);
    expect(fetchedUserByPk).toEqual(savedUser);

    const updatedUser = await userModel.updateByPk(savedUser.id, {
      password: 'new-password',
    });
    expect(updatedUser).toEqual({
      id: savedUser.id,
      username: 'admin',
      password: 'new-password',
    });

    const fetchUpdatedUser = await userModel.selectByPk(savedUser.id);
    expect(fetchUpdatedUser).toEqual({
      id: savedUser.id,
      username: 'admin',
      password: 'new-password',
    });
  });

  it('should throw when the duplicated value for unique column', async function () {
    @Table()
    class User {
      @PrimaryKey({ autoIncrement: true, unique: true })
      id: number;

      @Indexed({ unique: true, multiEntry: false })
      username: string;
    }

    const store = new Database({
      version: 1,
      name: 'Store-007',
      tables: [User],
    });

    await store.connect();

    const userModel = store.useModel(User);
    await userModel.insert({ username: 'admin' });
    await expect(userModel.insert({ username: 'admin' })).rejects.toThrow(
      /A mutation operation in the transaction failed/,
    );
  });
});
