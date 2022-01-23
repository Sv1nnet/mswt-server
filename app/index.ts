import 'module-alias/register';
import express from 'express';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import setRoutes from './routes/setRoutes';
import dbConnect from './utils/db/dbConnect';
import ip from 'utils/ips';
import cors from 'cors';

dotenv.config();
const API = '/api';
const app = express();

// app.use(cors())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Origin', req.headers.origin); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Set-Cookie, Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials');
  // res.header('Access-Control-Allow-Headers', 'Set-Cookie, Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials');
  res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT, PATCH');
  next();
});
app.use((req, res, next) => {
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  next();
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
