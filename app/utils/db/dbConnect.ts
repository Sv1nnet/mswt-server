// import mongoose from 'mongoose';

// export type DBConnect = {
//   err: null | Error;
//   con: typeof mongoose | null;
// }

// async function *dbConnect() {
//   let connection = null
//   while (true) {
//     try {
//       connection = await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
//         useNewUrlParser: true,
//         useFindAndModify: false,
//         useCreateIndex: true,
//         useUnifiedTopology: true,
//       });
//       if (!connection) throw new Error('No connection to DB')
//       return { err: null, con: connection }
//     } catch (error) {
//       console.log(error);
//       yield { err: error, con: null }; 
//     }
//   }
// }

// const __deprecatedDbConnect = async (): Promise<DBConnect> => {
//   try {
//     const con = await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
//       useNewUrlParser: true,
//       useFindAndModify: false,
//       useCreateIndex: true,
//       useUnifiedTopology: true,
//     });

//     return { err: null, con };
//   } catch (error) {
//     console.log(error);
//     return { err: error, con: null };
//   }
// };

// export default dbConnect;

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export type DBConnect = {
  err: null | Error;
  con: typeof mongoose | null;
}

export const DBIP = process.env.NODE_ENV === 'production'
  ? 'mongo'
  : process.env.NODE_ENV === 'doc-development'
  ? '172.19.0.1'
  : '127.0.0.1'

console.log('node env', process.env.NODE_ENV)
const dbip = `mongodb://${DBIP}:27017/${process.env.DB_NAME}`
console.log('dbip', dbip)

async function *dbConnect() {
  let connection = null
  while (true) {
    try {
      connection = await mongoose.connect(dbip, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true,
        useUnifiedTopology: true,
      });
      if (!connection) throw new Error('No connection to DB')
      return { err: null, con: connection }
    } catch (error) {
      console.log(error);
      yield { err: error, con: null }; 
    }
  }
}

export default dbConnect;
