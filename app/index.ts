import 'module-alias/register';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import setRoutes from './routes/setRoutes';
import dbConnect from './utils/db/dbConnect';
import ip from 'utils/ips';
import cors from 'cors';

dotenv.config();
const API = '/api';
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Origin', req.headers.origin); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials');
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
  if (req.method !== 'OPTIONS') console.log('Incoming request', req.method, req.url);
  next();
});

app.use(API, setRoutes());

const PORT: number = +process.env.SERVER_PORT;

app.get('/', (req, res) => res.send('Express + TypeScript Server'));

dbConnect().then(({ err, con }) => {
  if (con) {
    app.listen(PORT, () => {
      console.log(`⚡️[server]: Server is running at http://${ip.firstIp}:${PORT}`);
    });
  }

  if (err) console.log(err);
});
