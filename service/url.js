import iplocate from "node-iplocate";
import CounterRepository from '../schema/counter.js';
import UrlRepository from '../schema/url.js';
import ContinentRepository from '../schema/continent.js';

import client from '../database/redis.js';
import genCounter from "../helper/counter.js";

const LINK_EXPIRATION = parseInt(process.env.LINK_EXPIRATION_TIME) || 900;

export const ShortUrl = async (req, res) => {
    const {
        url
    } = req.query;


    const ip = "69.162.81.155";
    if (ip.length) {
        iplocate(ip).then(async (result) => {
            if (result) {
                let continentEntity = await ContinentRepository().search().where('name').equals(result.continent).return.all();
                continentEntity[0].entityData.links_gen += 1;
                ContinentRepository().save(continentEntity[0]);
            }
        }
        ).catch((err) => {
            console.error(err);
        });
    }

    let counterEntity = await CounterRepository().search().where('name').equals('links_generated').return.all();
    counterEntity[0].entityData.count = parseInt(counterEntity[0].entityData.count) + 1;
    await CounterRepository().save(counterEntity[0]);


    const urlEntity = UrlRepository().createEntity();
    urlEntity.long_url = url;
    urlEntity.short_url = await genCounter();
    urlEntity.created_at = new Date().toUTCString();

    const id = await UrlRepository().save(urlEntity);

    const s = await client.execute(['EXPIRE', `Url:${id}`, LINK_EXPIRATION]);

    res.status(200).json({ message: "success", data: { shortUrl: urlEntity.short_url } });

};

export const LongUrl = async (req, res) => {
    const ip = "69.162.81.155";
    if (ip.length) {
        iplocate(ip).then(async (result) => {
            if (result) {
                let continentEntity = await ContinentRepository().search().where('name').equals(result.continent).return.all();
                continentEntity[0].entityData.links_redirect += 1;
                ContinentRepository().save(continentEntity[0]);
            }
        }
        ).catch((err) => {
            console.error(err);
        });
    }

    const {
        code
    } = req.params;

    let counterEntity = await CounterRepository().search().where('name').equals('links_redirected').return.all();
    counterEntity[0].entityData.count = parseInt(counterEntity[0].entityData.count) + 1;
    await CounterRepository().save(counterEntity[0]);

    let url = await UrlRepository().search().where('short_url').equals(code).return.all();

    if (url.length) {
        res.redirect(url[0].entityData.long_url);
    } else {
        res.render('index.html', {
            url: process.env.FRONT_END_URL
        });
    }

};

export const UpdateExp = async (req, res) => {
    const {
        id
    } = req.params;

    let counterEntity = await CounterRepository().fetch(id);
    counterEntity.entityData.count += 1;
    await CounterRepository().save(counterEntity);

    res.status(200).json({
        message: "success", data: {
            record: counterEntity
        }
    });
};

export const GetExp = async (req, res) => {
    const records = await CounterRepository().search().where('name').not.eq('range').return.all();
    const totalRecords = records.length;
    res.status(200).json({
        message: "success", data: { totalRecords, records }
    });
};

export const GetContinent = async (req, res) => {
    const {
        c
    } = req.query;
    let records = [];
    if (typeof c !== "undefined") {
        if (c.length) {
            records = await ContinentRepository().search().where('name').equals(c).return.all();
        } else {
            records = await ContinentRepository().search().return.all();
        }

    }

    res.status(200).json({
        message: "success", data: { records }
    });

};

export const SaveInfo = async (req, res) => {
    let counterEntity = await CounterRepository().search().where('name').equals('visitor').return.all();
    counterEntity[0].entityData.count = parseInt(counterEntity[0].entityData.count) + 1;
    await CounterRepository().save(counterEntity[0]);

    const ip = "69.162.81.155";
    if (ip.length) {
        iplocate(ip).then(async (result) => {
            if (result) {
                let continentEntity = await ContinentRepository().search().where('name').equals(result.continent).return.all();
                if (continentEntity.length) {
                    continentEntity[0].entityData.visitor += 1;
                    await ContinentRepository().save(continentEntity[0]);
                } else {
                    const entity = ContinentRepository().createEntity();
                    entity.name = result.continent;
                    entity.visitor = 1;
                    entity.links_gen = 0;
                    entity.links_redirect = 0;
                    await ContinentRepository().save(entity);
                }
            }
        }
        ).catch((err) => {
            console.error(err);
        });
    }

    res.status(200).json({ message: 'success' });
};

