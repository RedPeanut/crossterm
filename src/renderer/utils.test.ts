import assert from 'assert';
// import fs from 'fs';
import { getTileRows } from './utils';

describe('#utils', function() {

  it('getTileRows', function() {
    assert.deepStrictEqual(getTileRows(1), [1]);
    assert.deepStrictEqual(getTileRows(2), [2]);
    assert.deepStrictEqual(getTileRows(3), [1, 2]);
    assert.deepStrictEqual(getTileRows(4), [2, 2]);
    assert.deepStrictEqual(getTileRows(5), [2, 3]);
    assert.deepStrictEqual(getTileRows(6), [3, 3]);
    assert.deepStrictEqual(getTileRows(7), [3, 4]);
    assert.deepStrictEqual(getTileRows(8), [4, 4]);
    assert.deepStrictEqual(getTileRows(9), [3, 3, 3]);
    assert.deepStrictEqual(getTileRows(10), [3, 3, 4]);
    assert.deepStrictEqual(getTileRows(11), [3, 4, 4]);
    assert.deepStrictEqual(getTileRows(12), [4, 4, 4]);
    assert.deepStrictEqual(getTileRows(13), [4, 4, 5]);
    assert.deepStrictEqual(getTileRows(14), [4, 5, 5]);
    assert.deepStrictEqual(getTileRows(15), [5, 5, 5]);
    assert.deepStrictEqual(getTileRows(16), [4, 4, 4, 4]);
  });

});
