import { Client } from 'redis-om';
import CounterRepository from '../schema/counter.js';
import ContinentRepository from '../schema/continent.js';
import UrlRepository from '../schema/url.js';
import constant from '../constants/var.js';

const client = new Client();
(async function () {
    await client.open(process.env.REDIS_URL);
    try {
        await CounterRepository().createIndex();
        await ContinentRepository().createIndex();
        await UrlRepository().createIndex();
    } catch (err) {
        console.error("Index already created!");
    }

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
            entity.count = 0;
            await CounterRepository().save(entity);
            i++;
        }

        const continentList = [
            'Asia',
            'Africa',
            'North America',
            'Oceania',
            'Europe',
            'South America'
        ];
        const clen = continentList.length;
        i = 0, entity = {};
        while (i < clen) {
            entity = ContinentRepository().createEntity();
            entity.name = continentList[i];
            entity.links_gen = 0;
            entity.links_redirect = 0;
            entity.visitor = 0;
            await ContinentRepository().save(entity);
            i++;
        }

        constant.counter = 1;
        constant.range = 100000;

        await client.execute(
            [
                'SET',
                'range', 100000]
        );
    } else {
        constant.range = await client.execute(
            [
                'INCRBY',
                'range', 100000]
        );
        constant.range = parseInt(constant.range);
        constant.counter = constant.range - 100000;
    }

})();

export default client;