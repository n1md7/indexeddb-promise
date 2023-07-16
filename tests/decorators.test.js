import { getClassMetadata, getPrimaryKey, getPropertyMetadata, Indexed, PrimaryKey, Table } from '../src';
import { describe, expect, test } from '@jest/globals';

describe('Decorators', () => {
  test('[@Table] decorator metadata with defaults', () => {
    function Test() {}

    Table()(Test);
    // or it can be class but for property metadata it has to be an instance
    // Table()(Test); Indexed()(new Test, 'prop-name');
    expect(getClassMetadata(Test)).toEqual({
      name: 'Test',
      initialData: [],
      timestamps: false,
    });
  });

  test('[@Table] decorator metadata with partially default values', () => {
    Table({ name: 'My-Name' })(Test);

    function Test() {}

    expect(getClassMetadata(Test)).toEqual({
      name: 'My-Name',
      initialData: [],
      timestamps: false,
    });
  });

  test('[@Table] decorator metadata with custom values', () => {
    Table({ name: 'My-Name', timestamps: true })(Test);

    function Test() {}

    expect(getClassMetadata(Test)).toEqual({
      name: 'My-Name',
      initialData: [],
      timestamps: true,
    });
  });

  test('[@Indexed] decorator metadata with defaults', () => {
    class Test {}

    const propertyName = 'propertyName';
    Indexed()(new Test(), propertyName);
    expect(getPropertyMetadata(Test)).toEqual({
      [propertyName]: {
        indexed: {
          unique: false,
          multiEntry: true,
        },
      },
    });
  });

  test('[@Indexed] decorator metadata with partially default values', () => {
    class Test {}

    const propertyName = 'propertyName';
    Indexed({ unique: true })(new Test(), propertyName);
    expect(getPropertyMetadata(Test)).toEqual({
      [propertyName]: {
        indexed: {
          unique: true,
          multiEntry: true,
        },
      },
    });
  });

  test('[@Indexed] decorator metadata with custom values', () => {
    class Test {}

    const propertyName = 'propertyName';
    Indexed({ unique: true, multiEntry: false })(new Test(), propertyName);
    expect(getPropertyMetadata(Test)).toEqual({
      [propertyName]: {
        indexed: {
          unique: true,
          multiEntry: false,
        },
      },
    });
  });

  test('[@getPrimaryKey] decorator', () => {
    class Test {}

    const propertyName = 'myPrimaryKey';
    PrimaryKey()(new Test(), propertyName);
    const primaryKeyPropName = getPrimaryKey(Test);
    expect(primaryKeyPropName).toBe(propertyName);
  });

  test('[@PrimaryKey] decorator metadata with defaults', () => {
    class Test {}

    const propertyName = 'propertyName';
    PrimaryKey()(new Test(), propertyName);
    expect(getPropertyMetadata(Test)).toEqual({
      [propertyName]: {
        primaryKey: {
          unique: true,
          autoIncrement: true,
        },
      },
    });
  });

  test('[@PrimaryKey] decorator metadata with partially default values', () => {
    class Test {}

    const propertyName = 'propertyName';
    PrimaryKey({ unique: false })(new Test(), propertyName);
    expect(getPropertyMetadata(Test)).toEqual({
      [propertyName]: {
        primaryKey: {
          unique: false,
          autoIncrement: true,
        },
      },
    });
  });

  test('[@PrimaryKey] decorator metadata with custom values', () => {
    class Test {}

    const propertyName = 'propertyName';
    PrimaryKey({ unique: false, autoIncrement: false })(new Test(), propertyName);
    expect(getPropertyMetadata(Test)).toEqual({
      [propertyName]: {
        primaryKey: {
          unique: false,
          autoIncrement: false,
        },
      },
    });
  });

  test('Full example of all decorators with defaults', () => {
    class Users {}

    Table()(Users);
    PrimaryKey()(new Users(), 'id');
    Indexed()(new Users(), 'name');
    Indexed()(new Users(), 'email');
    expect(getClassMetadata(Users)).toEqual({
      name: 'Users',
      timestamps: false,
      initialData: [],
    });
    expect(getPropertyMetadata(Users)).toEqual({
      id: {
        primaryKey: {
          unique: true,
          autoIncrement: true,
        },
      },
      name: {
        indexed: {
          unique: false,
          multiEntry: true,
        },
      },
      email: {
        indexed: {
          unique: false,
          multiEntry: true,
        },
      },
    });
  });

  test('Full example of all decorators with custom values', () => {
    class Users {}

    Table({ name: '__Table__', timestamps: true })(Users);
    PrimaryKey({ autoIncrement: false, unique: true })(new Users(), 'id');
    Indexed({ unique: false, multiEntry: true })(new Users(), 'name');
    Indexed({ unique: true, multiEntry: false })(new Users(), 'email');
    expect(getClassMetadata(Users)).toEqual({
      name: '__Table__',
      timestamps: true,
      initialData: [],
    });
    expect(getPropertyMetadata(Users)).toEqual({
      id: {
        primaryKey: {
          unique: true,
          autoIncrement: false,
        },
      },
      name: {
        indexed: {
          unique: false,
          multiEntry: true,
        },
      },
      email: {
        indexed: {
          unique: true,
          multiEntry: false,
        },
      },
    });
  });

  test('Several decorators overriding each other. Gets the last value', () => {
    class Users {}

    Table({ name: '__Table__', timestamps: true })(Users);
    Table({ name: 'Actual_Name', timestamps: false })(Users);
    PrimaryKey({ autoIncrement: false, unique: true })(new Users(), 'id');
    // Another line below gonna reset to defaults
    PrimaryKey()(new Users(), 'id');
    Indexed({ unique: false, multiEntry: true })(new Users(), 'name');
    Indexed()(new Users(), 'name');
    // The last one will be used as the value
    Indexed({ unique: true, multiEntry: true })(new Users(), 'name');
    // Will use defaults
    Indexed()(new Users(), 'email');
    expect(getClassMetadata(Users)).toEqual({
      name: 'Actual_Name',
      timestamps: false,
      initialData: [],
    });
    expect(getPropertyMetadata(Users)).toEqual({
      id: {
        primaryKey: {
          unique: true,
          autoIncrement: true,
        },
      },
      name: {
        indexed: {
          unique: true,
          multiEntry: true,
        },
      },
      email: {
        indexed: {
          unique: false,
          multiEntry: true,
        },
      },
    });
  });
});
