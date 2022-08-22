import {
    Entity,
    Schema
} from 'redis-om';

import client from '../database/redis.js';

class Url extends Entity { }
const urlSchema = new Schema(Url, {
    long_url: { type: 'string' },
    short_url: { type: 'string', indexed: true }
});

const UrlRepository = () => {
    return client.fetchRepository(urlSchema);
};

export default UrlRepository;
