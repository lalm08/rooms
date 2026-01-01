import { Type as T, type Static } from 'typebox'

// Devices
export const Device = T.Object({
  id: T.String(),
  name: T.String({ minLength: 1 })
})
export type Device = Static<typeof Device>

export const CreateDevice = T.Object({
  name: T.String({ minLength: 1 })
})
export type CreateDevice = Static<typeof CreateDevice>

// Auditories
export const Auditory = T.Object({
  id: T.String(),
  name: T.String({ minLength: 1 }),
  capacity: T.Optional(T.Number()),
  status: T.Optional(T.String())  
})
export type Auditory = Static<typeof Auditory>

export const CreateAuditory = T.Object({
  name: T.String({ minLength: 1 }),
  capacity: T.Optional(T.Number()),
  status: T.Optional(T.String())
})
export type CreateAuditory = Static<typeof CreateAuditory>

// Bookings
export const Booking = T.Object({
  id: T.String(),
  deviceId: T.String(),
  auditoryId: T.String()
})
export type Booking = Static<typeof Booking>

export const CreateBooking = T.Object({
  deviceId: T.String(),
  auditoryId: T.String()
})
export type CreateBooking = Static<typeof CreateBooking>
