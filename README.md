# mswt-server


1. Install MongoDB 
2. Rename `EXAMPLE.env` file to `.env` and configure it.
3. Run `npm i`
4. Run `npm run serve:dev`

To run the whole project:
1. Download [client app](https://github.com/Sv1nnet/my-simple-workout-tracker)
2. In the client folder run `npm run docker-build:prod`
3. In the server folder run `npm run docker-build:prod`
4. In the server folder run `docker-compose up`

The app will be accessible on the `CLIENT_ADDRESS` you specified in `.env` file
