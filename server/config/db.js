import mongoose from 'mongoose';

const connectToDB = async () => {
  const MONGO_URL = process.env.DB_URL?.trim();

  if (!MONGO_URL) {
    throw new Error('DB_URL is missing or empty in .env');
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log('DB connected successfully');
  } catch (err) {
    const msg = String(err?.message || err);
    if (msg.includes('ENOTFOUND') || msg.includes('querySrv')) {
      console.error(`
MongoDB could not resolve the host in DB_URL (DNS / SRV lookup failed).

Fix: open MongoDB Atlas → your Project → Database → "Connect" → Drivers → copy the
current connection string and replace the whole DB_URL= line in server/.env.

The hostname in your URI must match an active cluster (old or mistyped hostnames fail with ENOTFOUND).
`);
    }
    throw err;
  }
};

export default connectToDB;
