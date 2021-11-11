import ArraySorter from '../src/array-sorter';

describe.each([
  [null, [], true],
  [undefined, [], true],
  [1, [], true],
  [-1, [], true],
  [false, [], true],
  [true, [], true],
  [{}, [], true],
  ['', [], true],
  ['1', [], true],
  [0, [], true],
  [[], [], false],
  [[1], [1], false],
  [[1, 2, 3], [1, 2, 3], false],
  [[1, 3, 2], [1, 2, 3], false],
  [[null, 3, 2], [null, 2, 3], false],
  [[0, false, true, undefined, null, '', '1'], [0, false, null, '', true, '1', undefined], false],
  [['2', '1', '110', '101'], ['1', '2', '101', '110'], false],
  [['2', '1', '120', '101', '12'], ['1', '2', '12', '101', '120'], false],
  [['2', '1', 100, '101', '12'], ['1', '2', '12', 100, '101'], false],
  [['v', 'b', 'c', 'a', 'a'], ['a', 'a', 'b', 'c', 'v'], false],
  [
    [
      { val: 10, key: 3 },
      { val: 10, key: 1 },
      { val: 10, key: -1 },
    ],
    [
      { val: 10, key: -1 },
      { val: 10, key: 1 },
      { val: 10, key: 3 },
    ],
    false,
    'key',
  ],
  [
    [
      { val: 10, key: 3 },
      { val: 10, key: 1 },
      { val: 10, key: -1 },
    ],
    [
      { val: 10, key: 3 },
      { val: 10, key: 1 },
      { val: 10, key: -1 },
    ],
    false,
    'val',
  ],
  [
    [
      { val: 10, key: 3 },
      { val: 10, key: 1 },
      { val: 10, key: -1 },
    ],
    [
      { val: 10, key: -1 },
      { val: 10, key: 1 },
      { val: 10, key: 3 },
    ],
    false,
    { keys: ['key'] },
  ],
  [
    [
      { val: 10, key: 3 },
      { val: 10, key: 1 },
      { val: 10, key: -1 },
    ],
    [
      { val: 10, key: 3 },
      { val: 10, key: 1 },
      { val: 10, key: -1 },
    ],
    false,
    { keys: ['key'], desc: true },
  ],
  [
    [
      { val: 10, key: 1 },
      { val: 10, key: 1 },
      { val: 10, key: -1 },
    ],
    [
      { val: 10, key: 1 },
      { val: 10, key: 1 },
      { val: 10, key: -1 },
    ],
    false,
    { keys: ['key'], desc: true },
  ],
  [
    [
      { val: 10, key: 'a' },
      { val: 10, key: 'a' },
      { val: 10, key: 'b' },
    ],
    [
      { val: 10, key: 'b' },
      { val: 10, key: 'a' },
      { val: 10, key: 'a' },
    ],
    false,
    { keys: ['key'], desc: true },
  ],
  [
    [
      { val: 12, date: '2021-12-07T14:10:53.231Z' },
      { val: 10, date: '2021-11-07T14:10:53.231Z' },
      { val: 1, date: '2020-11-07T14:10:53.231Z' },
    ],
    [
      { val: 1, date: '2020-11-07T14:10:53.231Z' },
      { val: 10, date: '2021-11-07T14:10:53.231Z' },
      { val: 12, date: '2021-12-07T14:10:53.231Z' },
    ],
    false,
    { keys: ['date'], desc: false },
  ],
  [
    [
      { val: 12, date: '2021-12-07T14:10:53.231Z' },
      { val: 10, date: '2020-11-07T14:10:53.231Z' },
      { val: 1, date: '2020-11-07T14:10:53.231Z' },
    ],
    [
      { val: 1, date: '2020-11-07T14:10:53.231Z' },
      { val: 10, date: '2020-11-07T14:10:53.231Z' },
      { val: 12, date: '2021-12-07T14:10:53.231Z' },
    ],
    false,
    { keys: ['date', 'val'], desc: false },
  ],
  [
    [
      { val: 10, date: '2020-11-07T14:10:53.231Z' },
      { val: 1, date: '2020-11-07T14:10:53.231Z' },
      { val: 12, date: '2021-12-07T14:10:53.231Z' },
    ],
    [
      { val: 10, date: '2020-11-07T14:10:53.231Z' },
      { val: 1, date: '2020-11-07T14:10:53.231Z' },
      { val: 12, date: '2021-12-07T14:10:53.231Z' },
    ],
    false,
    { keys: ['date'], desc: false },
  ],
  [
    [
      { val: 12, date: '2021-12-07T14:10:53.231Z' },
      { val: 10, date: '2021-11-07T14:10:53.231Z' },
      { val: 100, date: '2020-11-07T14:10:53.231Z' },
    ],
    [
      { val: 10, date: '2021-11-07T14:10:53.231Z' },
      { val: 12, date: '2021-12-07T14:10:53.231Z' },
      { val: 100, date: '2020-11-07T14:10:53.231Z' },
    ],
    false,
    { keys: ['date', 'val'], desc: false },
  ],
  [
    [
      { val: 12, key: 'abc' },
      { val: 100, key: 'cde' },
      { val: 10, key: 'bcd' },
    ],
    [
      { val: 12, key: 'abc' },
      { val: 10, key: 'bcd' },
      { val: 100, key: 'cde' },
    ],
    false,
    { keys: ['key'], desc: false },
  ],
])('ArraySorter Sorting %o; expecting %o; throws %s; sortingBy %o;', function (sortList, expected, _throws, sortBy) {
  it('should sort array', function () {
    if (_throws) {
      expect(() => new ArraySorter(sortList).sortBy(sortBy)).toThrow();
    } else {
      expect(new ArraySorter(sortList).sortBy(sortBy)).toEqual(expected);
    }
  });
});
