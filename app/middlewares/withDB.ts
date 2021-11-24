import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';
import dbConnect, { DBConnect } from 'utils/db/dbConnect';

export interface IReqWithDB extends Request {
  db: DBConnect;
}

const withDB = async (req: IReqWithDB, res: Response, next: Function) => {
  const con = await dbConnect();
  if (!con.err) {
    req.db = con;
    return next();
  }

  res.statusCode = 500;
  res.json({ message: 'Could not connect to DB' });
};

export default withDB;
