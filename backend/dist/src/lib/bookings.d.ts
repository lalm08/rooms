import type { Prisma, PrismaClient } from '../generated/prisma/index.js';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';
export type BookingListQuery = {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    auditoryId?: string;
    organizer?: string;
    date?: string;
};
export declare function toBookingDto(booking: Prisma.BookingGetPayload<{
    include: {
        auditory: true;
        device: true;
    };
}>): {
    id: string;
    displayId: string;
    auditoryId: string;
    deviceId: string | null;
    title: string;
    organizer: string;
    organizerEmail: string;
    note: string | null;
    startAt: string;
    endAt: string;
    status: BookingStatus;
    createdAt: string;
    auditory: {
        id: string;
        code: string;
        name: string;
        capacity: number;
        building: string;
        floor: number;
        status: string;
    };
    device: {
        id: string;
        name: string;
    } | null;
};
export declare function buildBookingsWhere(query: BookingListQuery): Prisma.BookingWhereInput;
export declare function syncAuditoryStatus(prisma: PrismaClient, auditoryId: string): Promise<void>;
export declare function getBookingsStats(prisma: PrismaClient): Promise<{
    total: number;
    activeToday: number;
    pending: number;
    cancelledThisWeek: number;
    hoursThisMonth: number;
    usagePercent: number;
}>;
export type OccupancyCell = 'free' | 'occupied' | 'preparation' | 'unavailable';
export declare function getOccupancyGrid(prisma: PrismaClient, dateStr?: string): Promise<{
    date: string;
    hours: number[];
    rows: {
        auditoryId: string;
        code: string;
        name: string;
        cells: OccupancyCell[];
    }[];
}>;
export declare function getUpcomingBookings(prisma: PrismaClient, limit?: number): Promise<{
    id: string;
    displayId: string;
    auditoryId: string;
    deviceId: string | null;
    title: string;
    organizer: string;
    organizerEmail: string;
    note: string | null;
    startAt: string;
    endAt: string;
    status: BookingStatus;
    createdAt: string;
    auditory: {
        id: string;
        code: string;
        name: string;
        capacity: number;
        building: string;
        floor: number;
        status: string;
    };
    device: {
        id: string;
        name: string;
    } | null;
}[]>;
export declare function getBookingOrganizers(prisma: PrismaClient): Promise<string[]>;
//# sourceMappingURL=bookings.d.ts.map