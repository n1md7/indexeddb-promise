[![npm databaseVersion](https://badge.fury.io/js/@n1md7%2Findexeddb-promise.svg)](https://badge.fury.io/js/@n1md7%2Findexeddb-promise)
[![Node.js Package](https://github.com/n1md7/indexeddb-promise/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/n1md7/indexeddb-promise/actions/workflows/npm-publish.yml)
[![Node.js CI - tests](https://github.com/n1md7/indexeddb-promise/actions/workflows/node.js.yml/badge.svg)](https://github.com/n1md7/indexeddb-promise/actions/workflows/node.js.yml)
![GitHub](https://img.shields.io/github/license/n1md7/indexeddb-promise)
[![codecov](https://codecov.io/gh/n1md7/indexeddb-promise/branch/master/graph/badge.svg?token=Q5OJ22Q3LK)](https://codecov.io/gh/n1md7/indexeddb-promise)

# Indexed DB wrapper with promises

Supports all browsers that support IndexedDB.

Has TypeScript support with TS-class decorators.

## Demo

- [Basic Example01](https://n1md7.github.io/indexeddb-promise/Example01.html)
- [Advanced Example02](https://n1md7.github.io/indexeddb-promise/Example02.html)

## Installation

```shell
$ npm install @n1md7/indexeddb-promise
```

```shell
$ yarn add @n1md7/indexeddb-promise
```

## Methods

| Method          | Description                                | Params                  |
| --------------- | ------------------------------------------ | ----------------------- |
| `selectAll`     | Get the data from database                 | None                    |
| `select`        | Fetch data from database with filters      | Object                  |
| `insert`        | Add data into database                     | Object                  |
| `openCursor`    | Get database cursor to iterate on demand   | None                    |
| `selectByIndex` | Select database data by indexed properties | String, String          |
| `selectByPk`    | Select database record by primary key      | String \ Number         |
| `updateByPk`    | Update database record by primary key      | Number \ Number, Object |
| `deleteByPk`    | Delete database record by primary key      | String \ Number         |

### - selectAll

#### Params

Gets all the data from database.

Return type: Promise<Object[]>

Accept params: None

#### Javascript example

```javascript
model.selectAll().then((data) => data);
const data = await model.selectAll();
```

#### Typescript example

```typescript
model.selectAll().then((data) => {
  // In TS {data} is inferred from the model
  return data;
});
const data = await model.selectAll();
```

### - select

#### Params

Gets filtered data from database.

Return type: Promise<Object[]>

Accept params: options: Object

Object properties:

```text
{
  where?: Object | Function;
  limit?: Number;
  orderByDESC?: Boolean;
  sortBy?: String | String[];
}
```

#### Javascript/Typescript example

```javascript
const options = {
  limit: 10,
  where: (dataArray) => {
    return dataArray;
  },
  orderByDESC: true,
  sortBy: 'comments', // ['comments', 'date']
};
model.select(options).then((data) => data);
const data = await model.select(options);
```

@where property can filter out data like

```javascript
const props = {
  where: (data) => data.filter((item) => item.username === 'admin'),
};
```

or it can be an object, which gets data with AND(&&) comparison

```javascript
const props = {
  where: {
    username: 'admin',
    password: 'admin123',
  },
};
```

### - selectByIndex

#### Params

Gets the data from database with the specified indexed property.

Return type: Promise<Object|{}>

Accept params: indexName: string, valueToMatch: string

#### Javascript/Typescript example

```javascript
model.selectByIndex('username', 'admin').then((data) => data);
const data = await model.selectByIndex('username', 'admin');
```

### - selectByPk

#### Params

Gets the data from database with the specified primary key.

Return type: Promise<Object|{}>

Accept params: primaryKey: string \ number

#### Javascript/Typescript example

```javascript
model.selectByPk(1).then((data) => data);
const data = await model.selectByPk('admin');
```

### - updateByPk

#### Params

Updates the data in database with the specified primary key.

Return type: Promise<Object|{}>

Accept params: primaryKey: string \ number, Object

#### Javascript/Typescript example

```javascript
model.updateByPk(123, { username: 'admin' });
const data = await model.updateByPk(123, { username: 'admin' });
```

### - deleteByPk

#### Params

Deletes the data in database with the specified primary key.

Return type: Promise<String|Number>

Accept params: primaryKey: string \ number

#### Javascript/Typescript example

```javascript
model.deleteByPk(123);
const data = await model.deleteByPk(123);
```

_note_ Primary key is type sensitive. If it is saved as integer then should pass as integer and vice versa

## Examples

### Html 01

Once you add _indexed-db.min.js_ in your document then you will be able to access
`IndexedDB` variable globally which contains `Model`. They can be extracted as following

```html
<html>
  <head>
    <title>IndexedDB app</title>
    <script defer src="indexed-db.min.js"></script>
  </head>
  <body>
    <script>
      const Database = IndexedDB.Database;
      // Your script here
    </script>
  </body>
</html>
```

### Html 02

Basic usage of `Model`

```html
<html>
  <head>
    <title>IndexedDB app</title>
    <script src="indexed-db.min.js"></script>
  </head>
  <body>
    <script>
      const db = new IndexedDB.Database({
        databaseVersion: 1,
        databaseName: 'MyNewDatabase',
        tables: [
          {
            name: 'MyNewTable',
            primaryKey: {
              name: 'id',
              autoIncrement: false,
              unique: true,
            },
            initData: [],
            indexes: {
              username: { unique: false, autoIncrement: false },
              password: { unique: false, autoIncrement: false },
            },
          },
        ],
      });

      // Add a new record
      const model = db.useModel('MyNewTable');
      model
        .insert({
          id: Math.random() * 10,
          username: 'admin',
          password: 'nimda',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .then(function () {
          console.info('Yay, you have saved the data.');
        })
        .catch(function (error) {
          console.error(error);
        });

      // Get all results from the database
      model.selectAll().then(function (results) {
        console.log(...results);
      });
    </script>
  </body>
</html>
```

### Javascript

```javascript
const IndexedDB = require('@n1md7/indexeddb-promise');
const { Database } = IndexedDB;
// or
import { Database } from '@n1md7/indexeddb-promise';
```

### TypeScript 01

```typescript
import { Database } from '@n1md7/indexeddb-promise';

interface Users {
  id?: number;
  username: string;
  password: string;
}

enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

interface ToDos {
  id?: number;
  userId: number;
  title: string;
  description: string;
  done: boolean;
  priority: Priority;
}

const database = new Database({
  version: 1,
  name: 'Todo-list',
  tables: [
    {
      name: 'users',
      primaryKey: {
        name: 'id',
        autoIncrement: true,
        unique: true,
      },
      indexes: {
        username: {
          unique: false,
        },
      },
      timestamps: true,
    },
    {
      name: 'todos',
      primaryKey: {
        name: 'id',
        autoIncrement: true,
        unique: true,
      },
      indexes: {
        userId: {
          unique: true,
        },
      },
      timestamps: true,
    },
  ],
});

(async () => {
  await database.connect();
  const users = database.useModel<Users>('users');
  const user = await users.insert({
    username: 'admin',
    password: 'admin',
  });
  const todos = database.useModel<ToDos>('todos');
  await todos.insert({
    userId: user.id,
    title: 'Todo 1',
    description: 'Description 1',
    done: false,
    priority: Priority.LOW,
  });
})();
```

### TypeScript decorators 02

```typescript
import { Table, PrimaryKey, Indexed, Database } from '@n1md7/indexeddb-promise';

@Table({ name: '__Name__', timestamps: true })
class SomeTable {
  @PrimaryKey({ autoIncrement: true, unique: true })
  id: number;

  @Indexed({ unique: true, multiEntry: false })
  username: string;

  @Indexed({ unique: false })
  age: number;

  otherData: string;
}

const anotherDb = new Database({
  version: 1,
  name: 'Other-DB',
  tables: [SomeTable],
});

const model = anotherDb.useModel(SomeTable);

(async () => {
  await model
    .insert({
      username: 'John',
      age: 20,
      otherData: 'Some data',
    })
    .catch((error) => console.error(error));

  model.selectAll().then((results) => {
    if (results) {
      results.forEach((result) => {
        // result is inferred to be SomeTable
        console.log(result.username);
      });
    }
  });
})();
```

### TypeScript decorators 02

```typescript
import { Database, Indexed, PrimaryKey, Table } from '@n1md7/indexeddb-promise';

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

(async () => {
  const savedUser = await userModel.insert({
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
})().catch(console.log);

(async () => {
  const user = await userModel.selectByIndex('username', 'admin');
  if (!user) throw new Error('User not found');

  const info = await infoModel.select({ where: { userId: user.id } });
  if (!info) throw new Error('Info not found');

  console.log(user.toString() + ' - ' + info.toString());
})().catch(console.log);
```
