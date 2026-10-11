import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';

// slotDate is used inside a MongoDB field path, so only allow the "d_m_yyyy" format the frontend sends
const SLOT_DATE_RE = /^\d{1,2}_\d{1,2}_\d{4}$/;
const SLOT_TIME_RE = /^[0-9:\sAPMapm.]{3,12}$/;

export const isValidSlot = (slotDate, slotTime) =>
    typeof slotDate === 'string' && SLOT_DATE_RE.test(slotDate) &&
    typeof slotTime === 'string' && SLOT_TIME_RE.test(slotTime);

const slotKey = (slotDate) => `slots_booked.${slotDate}`;

// Atomically add slotTime to the doctor's booked slots, only if the doctor is available
// and the slot is still free. Returns the updated doctor (without password) or null.
export const claimSlot = (docId, slotDate, slotTime) =>
    doctorModel.findOneAndUpdate(
        { _id: docId, availability: true, [slotKey(slotDate)]: { $ne: slotTime } },
        { $push: { [slotKey(slotDate)]: slotTime } },
        { new: true }
    ).select('-password');

// Atomically remove slotTime from the doctor's booked slots (no-op if it isn't there)
export const releaseSlot = (docId, slotDate, slotTime) =>
    doctorModel.updateOne({ _id: docId }, { $pull: { [slotKey(slotDate)]: slotTime } });

// Cancel an appointment and free its slot exactly once.
// Returns false if it was already cancelled (or doesn't exist).
export const cancelAndReleaseSlot = async (appointmentId) => {
    const appointment = await appointmentModel.findOneAndUpdate(
        { _id: appointmentId, cancelled: false },
        { cancelled: true }
    );
    if (!appointment) return false;
    await releaseSlot(appointment.docId, appointment.slotDate, appointment.slotTime);
    return true;
}
