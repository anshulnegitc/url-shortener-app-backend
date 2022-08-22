import express from 'express';

const router = express.Router();

import {
    ShortUrl,
    LongUrl,
    UpdateExp,
    GetExp,
    GetContinent,
    SaveInfo
} from '../service/url.js';

//#region Expression
router.get('/u-exp/:id', UpdateExp);
router.get('/g-exp', GetExp);
//#endregion

//#region Analytics
router.get('/s-info', SaveInfo);
router.get('/continent', GetContinent);
//#endregion

//#region URL
router.get('/s-url', ShortUrl);
router.get('/:code', LongUrl);
//#endregion

export default router;