import * as async from './async';

const queue = new async.Queue();
queue.queue(async () => {
  await async.timeout(1000);
  return 'A'
}).then(res => console.log('결과:', res));
queue.queue(async () => {
  await async.timeout(500);
  return 'B'
}).then(res => console.log('결과:', res));