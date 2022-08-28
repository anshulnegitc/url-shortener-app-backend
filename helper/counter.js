import client from '../database/redis.js';

let counter = 0, range = 0;

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
    if (!counter || !range || counter > range) {
        counter = await client.execute(
            [
                'INCRBY',
                'range', 100000]
        );
        counter = parseInt(counter);
        range = counter + 100000;
    }
    ++counter;
    return toBase62(counter);
}

export default genCounter;