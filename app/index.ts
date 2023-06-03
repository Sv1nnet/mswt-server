/** @format */

import "module-alias/register";
import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import setRoutes from "./routes/setRoutes";
import cors from "cors";
import path from "path";
import runServer from "./utils/runServer";

(global as typeof globalThis).appRoot = path.resolve(__dirname);

dotenv.config();
const API = "/api";
const app = express();

// if (process.env.NODE_ENV === 'production') {
// app.use(cors({
//   credentials: true,
//   origin: true
// }))
// } else {
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Origin", req.headers.origin); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Set-Cookie, Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials");
    // res.header('Access-Control-Allow-Headers', 'Set-Cookie, Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Credentials');
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT, PATCH");
    next();
  });
  app.use((req, res, next) => {
    res.header("Access-Control-Expose-Headers", "Set-Cookie");
    next();
  });
}
// }

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.method !== "OPTIONS") console.log("Incoming request", req.method, req.url);
  next();
});

app.use(API, setRoutes());

app.get("/", (req, res) => res.send("Express + TypeScript Server"));

runServer({ app });
