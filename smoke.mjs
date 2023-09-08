'use strict';

import assert from 'assert';
import axios from 'axios';
const client = axios.create({
  baseURL: 'http://localhost:3000'
});

await client.post('/users', {
  id: 'admin1',
  name: 'John Admin',
  roles: ['admin']
});

await client.post('/users', {
  id: 'user1',
  name: 'Joe User'
});

await client.post(
  '/threads',
  { id: 'thread1', title: 'Test 1' },
  { headers: { authorization: 'user1' } }
);

await client.put(
  '/threads/thread1/comment',
  { body: 'test' },
  { headers: { authorization: 'user1' } }
);

let err = await client.put(
  '/threads/thread1/lock',
  { locked: true },
  { headers: { authorization: 'user1' } }
).then(() => null, err => err);
console.log(err.response.data);

await client.put(
  '/threads/thread1/lock',
  { locked: true },
  { headers: { authorization: 'admin1' } }
).then(() => null, err => err);

err = await client.put(
  '/threads/thread1/comment',
  { body: 'test comment' },
  { headers: { authorization: 'user1' } }
).then(() => null, err => err);
console.log(err.response.data);

await client.put(
  '/threads/thread1/lock',
  { locked: false },
  { headers: { authorization: 'admin1' } }
).then(() => null, err => err);

await client.put(
  '/threads/thread1/comment',
  { body: 'test' },
  { headers: { authorization: 'user1' } }
);

err = await client.put(
  '/users/admin1/ban',
  { banned: true },
  { headers: { authorization: 'user1' } }
).then(() => null, err => err);
console.log(err.response.data);

await client.put(
  '/users/user1/ban',
  { banned: true },
  { headers: { authorization: 'admin1' } }
);

err = await client.put(
  '/threads/thread1/comment',
  { body: 'test comment' },
  { headers: { authorization: 'user1' } }
).then(() => null, err => err);
console.log(err.response.data);