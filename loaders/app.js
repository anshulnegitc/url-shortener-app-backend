import express from 'express';
import routes from '../routes/index.js';
import cors from 'cors';
import path from 'path';
import ejs from 'ejs';
const app = express();

app.set('views', path.join(path.resolve(), 'public'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html')
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.static('../public'));
app.use(cors());
app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome." });
});

app.use('/', routes);

process.on("UnhandledPromiseRejection", (err) => {
    console.log("Unhandled : ", err);
});

export default app;