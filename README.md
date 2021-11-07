[![npm version](https://badge.fury.io/js/@n1md7%2Findexeddb-promise.svg)](https://badge.fury.io/js/@n1md7%2Findexeddb-promise)
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
<script src="https://bundle.run/@n1md7/indexeddb-promise@2.0.0"></script>
<script src="https://unpkg.com/@n1md7/indexeddb-promise@2.0.0/src/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@n1md7/indexeddb-promise@2.0.0/dist/indexed-db.min.js"></script>
```

### Available methods

- select
- insert
- selectAll
- selectByPk
- updateByPk
- deleteByPk

### .selectAll(): Promise

Gets all the data from db and returns promise with response data

### .selectByPk(pKey: string): Promise

Has one parameter `pkey` as primaryKey and returns promise with data

### .select({...}): Promise

Has one parameter `props` which can be

```javascript
/**
 * @typedef {string | number | boolean | null | undefined} Item
 */
/**
 * @typedef {{[key: string]: Item} | Item} ListItem
 */
/**
 * @param  {{
 *   where?: {
 *     [key: string]: any
 *   } | function(ListItem[]):ListItem[],
 *   limit?: number,
 *   orderByDESC?: boolean,
 *   sortBy?: string | string[]
 * }} options
 * @returns {Promise<ListItem[]>}
 */
props = {
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
where: (data) => data.filter((item) => item.username === 'admin');
```

or it can be an object, which gets data with AND(&&) comparison

```javascript
props = {
  where: {
    username: 'admin',
    password: 'admin123',
  },
};
```

### .updateByPk(pKey, {...}): Promise

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
const { Model } = IndexedDBModel;

// or
const Model = IndexedDBModel.Model;
```

### Create example config

```javascript
class DB extends IndexedDBModel.Model {
  //@overrides default method
  get config() {
    return {
      version: 1,
      databaseName: 'myNewDatabase',
      tableName: 'myNewTable',
      primaryKey: {
        name: 'id',
        autoIncrement: false,
        unique: true,
      },
      initData: [],
      structure: {
        username: { unique: false, autoIncrement: false },
        password: { unique: false, autoIncrement: false },
        createdAt: { unique: false, autoIncrement: false },
        updatedAt: { unique: false, autoIncrement: false },
      },
    };
  }
}
```

### Create connector

```javascript
const db = new DB();
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
      class DB extends IndexedDBModel.Model {
        //@overrides default method
        get config() {
          return {
            version: 1,
            databaseName: 'myNewDatabase',
            tableName: 'myNewTable',
            primaryKey: {
              name: 'id',
              autoIncrement: false,
              unique: true,
            },
            initData: [],
            structure: {
              username: { unique: false, autoIncrement: false },
              password: { unique: false, autoIncrement: false },
              createdAt: { unique: false, autoIncrement: false },
              updatedAt: { unique: false, autoIncrement: false },
            },
          };
        }
      }

      const db = new DB();

      // add a new record
      db.insert({
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
      db.selectAll().then(function (results) {
        console.log(...results);
      });
    </script>
  </body>
</html>
```

```javascript
const IndexedDBModel = require('@n1md7/indexeddb-promise');
const { Model } = IndexedDBModel;
// or
import { Model } from '@n1md7/indexeddb-promise';
```
