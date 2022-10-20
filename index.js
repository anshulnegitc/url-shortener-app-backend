import 'dotenv/config';
import app from './loaders/app.js';

app.listen(process.env.PORT, () => {
    console.log(`Application running at PORT : ${process.env.PORT}`);
});

module.exports = app;
