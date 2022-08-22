import { Client, Entity, Schema } from 'redis-om';
const client = new Client();
(async function () {
    await client.open(process.env.REDIS_URL);
})();

export default client;