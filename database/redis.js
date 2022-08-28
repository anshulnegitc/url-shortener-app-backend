import { Client } from 'redis-om';
import CounterRepository from '../schema/counter.js';
import ContinentRepository from '../schema/counter.js';
import UrlRepository from '../schema/url.js';

const client = new Client();
(async function () {
    await client.open(process.env.REDIS_URL);
    const records = await CounterRepository().search().return.all();

    if (!records.length) {
        const expList = [
            'like',
            'heart',
            'visitor',
            'links_redirected',
            'links_generated',
            'star'
        ];
        const len = expList.length;
        let i = 0, entity = {};
        while (i < len) {
            entity = CounterRepository().createEntity();
            entity.name = expList[i];
            entity.count = expList[i] === 'range' ? 1 : 0;
            await CounterRepository().save(entity);
            i++;
        }

        CounterRepository().createIndex();
        ContinentRepository().createIndex();
        UrlRepository().createIndex();
        await client.execute(
            [
                'SET',
                'range', 1]
        );
    }

})();

export default client;