import iplocate from "node-iplocate";
import CounterRepository from '../schema/counter.js';
import UrlRepository from '../schema/url.js';
import ContinentRepository from '../schema/continent.js';

import client from '../database/redis.js';
import genCounter from "../helper/counter.js";

const LINK_EXPIRATION = parseInt(process.env.LINK_EXPIRATION_TIME) || 900;

const saveIp = async (ip, type) => {
    iplocate(ip).then(async (result) => {
        if (result) {
            let continentEntity = await ContinentRepository().search().where('name').equals(result.continent).return.first();
            if (continentEntity) {
                continentEntity.entityData[[type]] += 1;
                await ContinentRepository().save(continentEntity);
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
};

const counterInc = async (name) => {
    let counterEntity = await CounterRepository().search().where('name').equals(name).return.first();
    counterEntity.entityData.count = parseInt(counterEntity.entityData.count) + 1;
    await CounterRepository().save(counterEntity);
};

export const ShortUrl = async (req, res) => {
    const {
        url
    } = req.query;


    const ip = req.headers["x-forwarded-for"];
    if (ip.length) {
        saveIp(ip, 'links_gen');
    }

    counterInc('links_generated');


    const urlEntity = UrlRepository().createEntity();
    urlEntity.long_url = url;
    urlEntity.short_url = await genCounter();
    urlEntity.created_at = new Date().toUTCString();

    const id = await UrlRepository().save(urlEntity);

    await client.execute(['EXPIRE', `Url:${id}`, LINK_EXPIRATION]);

    res.status(200).json({ message: "success", data: { shortUrl: urlEntity.short_url } });

};

export const LongUrl = async (req, res) => {
    const ip = req.headers["x-forwarded-for"];
    if (ip.length) {
        await saveIp(ip, 'links_redirect');
    }

    const {
        code
    } = req.params;

    let url = await UrlRepository().search().where('short_url').equals(code).return.first();
    if (url) {
        counterInc('links_redirected');
        res.redirect(url.entityData.long_url);
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
    const records = await CounterRepository().search().return.all();
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
    counterInc('visitor');

    const ip = req.headers["x-forwarded-for"];

    if (ip.length) {
        saveIp(ip, 'visitor');
    }

    res.status(200).json({ message: 'success' });
};

