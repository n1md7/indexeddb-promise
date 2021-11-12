[![npm databaseVersion](https://badge.fury.io/js/@n1md7%2Findexeddb-promise.svg)](https://badge.fury.io/js/@n1md7%2Findexeddb-promise)
[![Node.js Package](https://github.com/n1md7/indexeddb-promise/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/n1md7/indexeddb-promise/actions/workflows/npm-publish.yml)
[![Node.js CI - tests](https://github.com/n1md7/indexeddb-promise/actions/workflows/node.js.yml/badge.svg)](https://github.com/n1md7/indexeddb-promise/actions/workflows/node.js.yml)
![GitHub](https://img.shields.io/github/license/n1md7/indexeddb-promise)
[![codecov](https://codecov.io/gh/n1md7/indexeddb-promise/branch/master/graph/badge.svg?token=Q5OJ22Q3LK)](https://codecov.io/gh/n1md7/indexeddb-promise)

# Indexed DB wrapper with promises

## Demo

- [Basic Example01](https://n1md7.github.io/indexeddb-promise/examples/Example01.html)
- [Advanced Example02](https://n1md7.github.io/indexeddb-promise/examples/Example02.html)

## Installation

```shell script
npm install @n1md7/indexeddb-promise --save
# or
yarn add @n1md7/indexeddb-promise
```

or

```shell script
<script src="https://bundle.run/@n1md7/indexeddb-promise@5.0.21"></script>
<script src="https://unpkg.com/@n1md7/indexeddb-promise@5.0.21/src/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@n1md7/indexeddb-promise@5.0.21/dist/indexed-db.min.js"></script>
```

### Available methods

- select
- insert
- selectAll
- setTable
- selectByIndex
- selectByPk
- updateByPk
- deleteByPk

### .selectAll(): Promise

Gets all the data from db and returns promise with response data

### .selectByIndex(indexName: string, valueToMatch: string): Promise

Gets data from the db and returns promise with response data

### .selectByPk(pKey: string): Promise

Has one parameter `pkey` as primaryKey and returns promise with data

### .select({...}): Promise

Has one parameter `props` which can be

```javascript
const props = {
  limit: 10,
  where: (dataArray) => {
    return dataArray;
  },
  orderByDESC: true,
  sortBy: 'comments', // ['comments', 'date']
};
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

### .updateByPk(pKey: string | number, {...}): Promise

Has two parameters `pkey` and `keyValue` pair of updated data

```javascript
updateByPk(123, { username: 'admin' });
```

### .deleteByPk(pKey): Promise

Has one parameter `pKey` which record to delete based on primary key

_note_ primary key is type sensitive. If it is saved as integer then should pass as integer and vice versa

## Usage example

```html
<html>
  <head>
    <title>IndexedDB app</title>
    <script src="./dist/indexed-db.min.js"></script>
  </head>
  <body>
    <script>
      // Your script here
    </script>
  </body>
</html>
```

Once you add _indexed-db.min.js_ in your document then you will be able to access
`IndexedDBModel` variable globally which contains `Model`. They can be extracted as following

```javascript
const { Database } = IndexedDBModel;

// or
const Database = IndexedDBModel.Database;
```

### Create connector and pass the config

```javascript
const db = new IndexedDBModel.Database({
  databaseVersion: 1,
  databaseName: 'myNewDatabase',
  tables: [
    {
      name: 'myNewTable',
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
      timestamps: true,
    },
  ],
});
```

### Full example

```html
<html>
  <head>
    <title>IndexedDB app</title>
    <script src="./dist/indexed-db.min.js"></script>
  </head>
  <body>
    <script>
      const db = new IndexedDBModel.Database({
        databaseVersion: 1,
        databaseName: 'myNewDatabase',
        tables: [
          {
            name: 'myNewTable',
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

      // add a new record
      db.setTable('myNewTable')
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
      db.setTable('myNewTable')
        .selectAll()
        .then(function (results) {
          console.log(...results);
        });
    </script>
  </body>
</html>
```

```javascript
const IndexedDBModel = require('@n1md7/indexeddb-promise');
const { Database } = IndexedDBModel;
// or
import { Database } from '@n1md7/indexeddb-promise';
```

Typescript example

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

const database = new Database<Users | ToDos>({
  version: 2,
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
  const user = await database.setTable('users').insert({
    username: 'admin',
    password: 'admin',
  });
  await database.setTable('todos').insert({
    userId: user.id,
    title: 'Todo 1',
    description: 'Description 1',
    done: false,
    priority: Priority.LOW,
  });
})();
```
