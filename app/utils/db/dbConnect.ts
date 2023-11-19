import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export type DBConnect = {
  err: null | Error;
  con: typeof mongoose | null;
};

export const DBIP = process.env.NODE_ENV === "production" ? "mongo" : process.env.NODE_ENV === "doc-development" ? "172.19.0.1" : "127.0.0.1";

const dbip =
  process.env.NODE_ENV === 'development'
    ? `mongodb://${DBIP}:27017/${process.env.DB_NAME}`
    : `${process.env.NODE_ENV === "production" ? process.env.MONGODB_URI : "mongodb://root:example@mongodb:27017"}/${process.env.DB_NAME}`;

const MongoClient = require("mongodb").MongoClient;

async function* dbConnect() {
  let connection = null;

  if (process.env.NODE_ENV === "production") {
    try {
      await new Promise((res, rej) => {
        MongoClient.connect(process.env.MONGODB_URI, { useNewUrlParser: true }, (err, client) => {
          if (err) throw err;
          const db = client.db(process.env.DB_NAME);

          const command = {
            usersInfo: { user: "root", db: process.env.DB_NAME },
          };
          db.command(command, (err, result) => {
            if (err) {
              rej(err);
            }
            if (result.users.length === 0) {
              db.addUser(
                "root",
                "example",
                {
                  roles: [{ role: "readWrite", db: process.env.DB_NAME }],
                },
                (err, result) => {
                  if (err) {
                    throw err;
                  }
                  res(void 0);
                  client.close();
                }
              );
            } else {
              res(void 0);
              client.close();
            }
          });
        });
      });
    } catch (err) {
      return { err, con: null };
    }
  } else {
  }

  while (true) {
    try {
      connection = await mongoose.connect(dbip, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
      if (!connection) throw new Error("No connection to DB");
      return { err: null, con: connection };
    } catch (error) {
      console.log(error);
      yield { err: error, con: null };
    }
  }
}

export default dbConnect;
