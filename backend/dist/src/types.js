import { Type as T } from 'typebox';
// Devices
export const Device = T.Object({
    id: T.String(),
    name: T.String({ minLength: 1 })
});
export const CreateDevice = T.Object({
    name: T.String({ minLength: 1 })
});
// Auditories
export const Auditory = T.Object({
    id: T.String(),
    name: T.String({ minLength: 1 }),
    capacity: T.Optional(T.Number()),
    status: T.Optional(T.String())
});
export const CreateAuditory = T.Object({
    name: T.String({ minLength: 1 }),
    capacity: T.Optional(T.Number()),
    status: T.Optional(T.String())
});
// Bookings
export const Booking = T.Object({
    id: T.String(),
    deviceId: T.String(),
    auditoryId: T.String()
});
export const CreateBooking = T.Object({
    deviceId: T.String(),
    auditoryId: T.String()
});
//# sourceMappingURL=types.js.map