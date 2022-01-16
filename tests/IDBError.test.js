import IDBError from '../src/IDBError';

test('IDBError.compose', () => {
  const compose = IDBError.compose('Error text');
  expect(compose).toBeInstanceOf(Array);
  expect(compose).toHaveLength(1);
  expect(compose).toEqual([
    {
      message: 'Error text',
      path: ['unknown'],
      type: 'string',
    },
  ]);
});

test('IDBError when throws', () => {
  const compose = IDBError.compose('Error text');
  const error = new IDBError(compose);
  expect(error).toBeInstanceOf(Error);
  expect(error.name).toBe('IDBValidationError');
  expect(() => {
    throw error;
  }).toThrowError('Error text');
});

test('IDBError overrides error message', () => {
  const compose = IDBError.compose('Error text');
  const error = new IDBError(compose, { message: 'New error text' });
  expect(() => {
    throw error;
  }).toThrowError('New error text');
});

test('IDBError when throws custom type', () => {
  const error = new IDBError([], {
    type: 'CustomException',
    message: 'Custom Error text',
  });
  expect(error).toBeInstanceOf(Error);
  expect(error.name).toBe('CustomException');
  expect(() => {
    throw error;
  }).toThrowError('Custom Error text');
});

test('IDBError.is method', () => {
  const errorDifferentType = new IDBError([], {
    type: 'CustomException',
    message: 'Custom Error text',
  });
  const errorDefaultType = new IDBError([], {
    message: 'Custom Error text',
  });
  expect(IDBError.is(errorDifferentType)).toBeFalsy();
  expect(IDBError.is(errorDefaultType)).toBeTruthy();
  expect(IDBError.is(new Error())).toBeFalsy();
});
