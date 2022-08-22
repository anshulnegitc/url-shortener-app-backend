import {
    Entity,
    Schema
} from 'redis-om';

import client from '../database/redis.js';

class Counter extends Entity { }
const counterSchema = new Schema(Counter, {
    name: { type: 'string', indexed: true },
    count: { type: 'number' },
});

const CounterRepository = () => {
    return client.fetchRepository(counterSchema);
};
export default CounterRepository;
