import mongoose from "mongoose";
import dns from "dns";

// optional: some Windows setups can't resolve mongodb+srv:// with Node's default DNS
if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(','));
}

const connectDB = async () => {
    mongoose.connection.on('connected', () => console.log("Database connected"));
    await mongoose.connect(process.env.MONGODB_URL, { dbName: 'CareSync' });
};

export default connectDB;