import client from '../database/redis.js';

import constant from '../constants/var.js';

function toBase62(num) {
    if (num === 0) {
        return '0';
    }
    var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var len = Math.min(digits.length, 62);
    var result = '';
    while (num > 0) {
        result = digits[num % len] + result;
        num = parseInt(num / len, 10);
    }

    return String(result).padStart(7, '0');
}

async function genCounter() {
    ++constant.counter;
    if (constant.counter > constant.range) {
        constant.range = await client.execute(
            [
                'INCRBY',
                'range', 100000]
        );
        constant.range = parseInt(counter.range);
    }
    return toBase62(constant.counter);
}

export default genCounter;