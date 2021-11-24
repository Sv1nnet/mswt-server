import mongoose from 'mongoose';

export type DBConnect = {
  err: null | Error;
  con: typeof mongoose | null;
};

const dbConnect = async (): Promise<DBConnect> => {
  try {
    const con = await mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB_NAME}`, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });

    return { err: null, con };
  } catch (error) {
    console.log(error);
    return { err: error, con: null };
  }
};

export default dbConnect;
