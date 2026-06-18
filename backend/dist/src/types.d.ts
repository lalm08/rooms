import { Type as T, type Static } from 'typebox';
export declare const Device: T.TObject<{
    id: T.TString;
    name: T.TString;
}>;
export type Device = Static<typeof Device>;
export declare const CreateDevice: T.TObject<{
    name: T.TString;
}>;
export type CreateDevice = Static<typeof CreateDevice>;
export declare const Auditory: T.TObject<{
    id: T.TString;
    name: T.TString;
    capacity: T.TOptional<T.TNumber>;
    status: T.TOptional<T.TString>;
}>;
export type Auditory = Static<typeof Auditory>;
export declare const CreateAuditory: T.TObject<{
    name: T.TString;
    capacity: T.TOptional<T.TNumber>;
    status: T.TOptional<T.TString>;
}>;
export type CreateAuditory = Static<typeof CreateAuditory>;
export declare const Booking: T.TObject<{
    id: T.TString;
    deviceId: T.TString;
    auditoryId: T.TString;
}>;
export type Booking = Static<typeof Booking>;
export declare const CreateBooking: T.TObject<{
    deviceId: T.TString;
    auditoryId: T.TString;
}>;
export type CreateBooking = Static<typeof CreateBooking>;
//# sourceMappingURL=types.d.ts.map