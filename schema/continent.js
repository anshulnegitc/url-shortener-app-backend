import {
    Entity,
    Schema
} from 'redis-om';

import client from '../database/redis.js';

class Continent extends Entity { }
const continentSchema = new Schema(Continent, {
    name: { type: 'string', indexed: true },
    links_gen: { type: 'number' },
    links_redirect: { type: 'number' },
    visitor: { type: 'number' },
});

const ContinentRepository = () => {
    return client.fetchRepository(continentSchema);
};

export default ContinentRepository;