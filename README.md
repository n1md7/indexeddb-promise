# Indexed DB with promises

![npm](https://img.shields.io/npm/v/@n1md7/indexeddb-promise)
![GitHub](https://img.shields.io/github/license/n1md7/indexeddb-promise)

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
<script src="https://bundle.run/@n1md7/indexeddb-promise@1.1.3"></script>
<script src="https://unpkg.com/@n1md7/indexeddb-promise@1.1.3/src/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@n1md7/indexeddb-promise@1.1.3/dist/indexeddb.min.js"></script>
```

### Properties

- selectAll
- selectFrom
- selectWhere
- updateByPk
- deleteByPk

### .selectAll()

Gets all the data from db and returns promise with response data

### .selectFrom(pKey)

Has one parameter `pkey` as primaryKey and returns promise with data

### .selectWhere({...})

Has one parameter `props` which can be

```javascript
props = {
  limit: 10,
  where: (dataArray) => {
    return dataArray;
  },
  orderByDESC: true,
  sortBy: 'comments', // ['comments', 'date']
};
```

@where property can filter out data
like `where: data => data.filter(dt.username === 'admin')`

### .updateByPk(pKey, {...})

Has two parameters `pkey` and `keyValue` pair of updated data
`.updateByPk(123, {username: 'admin'})`

### .deleteByPk(pKey)

Has one parameter `pKey` which record to delete based on primary key

_note_ primary key is type sensitive. If it is saved as integer then should pass as integer and vice versa

## Usage example

```html
<html>
  <head>
    <title>IndexedDB app</title>
    <script src="./dist/indexeddb-promise.min.js"></script>
  </head>
  <body>
    <script>
      // Your script here
    </script>
  </body>
</html>
```

Once you add _indexeddb-promise.min.js_ in your document then you will be able to access
`indexedDBModel` variable globally which contains `Model` and `ModelConfig`.
They can be extracted as following

```javascript
const { Model } = indexedDBModel;

// or
const Model = indexedDBModel.Model;
```

### Create example config

```javascript
class DB extends Model {
  //@overrides default method
  get config() {
    return {
      version: 1,
      databaseName: 'myNewDatabase',
      tableName: 'myNewTable',
      primaryKey: {
        name: 'id',
        autoIncrement: false,
      },
      initData: [],
      structure: {
        roomId: { unique: false, autoIncrement: true },
        roomName: { unique: false, autoIncrement: false },
        comments: { unique: false, autoIncrement: false },
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
    <script src="indexeddb-promise.min.js"></script>
  </head>
  <body>
    <script>
      const { Model } = indexedDBModel;

      class DB extends Model {
        //@overrides default method
        get config() {
          return {
            version: 1,
            databaseName: 'myNewDatabase',
            tableName: 'myNewTable',
            primaryKey: {
              name: 'id',
              autoIncrement: false,
            },
            initData: [],
            structure: {
              roomId: { unique: false, autoIncrement: true },
              roomName: { unique: false, autoIncrement: false },
              comment: { unique: false, autoIncrement: false },
            },
          };
        }
      }

      const db = new DB();

      // add new record
      db.insert({
        id: Math.random() * 10,
        roomName: 'My room name',
        roomId: 1,
        comment: 'This room is awesome',
      })
        .then(function () {
          //when done click update button
          console.info('Yay, you have saved the data.');
        })
        .catch(function (error) {
          console.error(error);
        });

      // Get all results from DB
      db.selectAll().then(function (results) {
        console.log(...results);
      });
    </script>
  </body>
</html>
```

```javascript
const indexedDBModel = require('@n1md7/indexeddb-promise');
const { Model } = indexedDBModel;
```
