This is a demo fantasy football draft application created with Next.js and Firebase's RealTime Database.

## Getting Started

You will need to have the [firebase cli](https://firebase.google.com/docs/cli) and [Node v18+](https://nodejs.org/en)
installed.

There are three npm run commands needed to start.

**npm run emul** will start the firebase emulator for the RealTime database.

**npm run seed** will populate the database will some data

**npm run dev** will start the next server

```bash
npm run emul
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Currently, there are only two users that can log in:
Phillibus, and LittleJohn. If you look into the data folder, you can see the login and password information.

## Deployment

Using Vercel to deploy the application to the server. Check the github page for url information. 
