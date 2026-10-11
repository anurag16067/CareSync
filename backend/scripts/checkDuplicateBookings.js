// Lists active (non-cancelled) appointments that share the same doctor + date + time.
// The unique index in appointmentModel can't be built while any of these exist.
// Usage: node scripts/checkDuplicateBookings.js   (read-only)
import 'dotenv/config';
import mongoose from 'mongoose';
import dns from 'dns';

if (process.env.DNS_SERVERS) dns.setServers(process.env.DNS_SERVERS.split(','));

await mongoose.connect(process.env.MONGODB_URL, { dbName: 'CareSync' });

const duplicates = await mongoose.connection.collection('appointments').aggregate([
    { $match: { cancelled: false } },
    { $group: {
        _id: { docId: '$docId', slotDate: '$slotDate', slotTime: '$slotTime' },
        count: { $sum: 1 },
        ids: { $push: '$_id' },
    } },
    { $match: { count: { $gt: 1 } } },
]).toArray();

if (duplicates.length === 0) {
    console.log('No duplicate active bookings. Safe to build the unique index.');
} else {
    console.log(`Found ${duplicates.length} double-booked slot(s):`);
    for (const d of duplicates) {
        console.log(`  doctor ${d._id.docId}  ${d._id.slotDate} ${d._id.slotTime}  appointments: ${d.ids.join(', ')}`);
    }
    console.log('Cancel all but one appointment per slot before restarting the server.');
}

await mongoose.disconnect();
