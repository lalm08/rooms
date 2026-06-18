import type { Prisma, PrismaClient } from '../generated/prisma/index.js';
export type RoomStatus = 'available' | 'booked' | 'maintenance';
export interface RoomDto {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    capacity: number;
    building: string;
    floor: number;
    equipment: string[];
    status: RoomStatus;
}
export interface RoomsQuery {
    page?: number;
    limit?: number;
    search?: string;
    building?: string;
    floor?: number;
    status?: string;
    equipment?: string;
}
export declare function toRoomDto(a: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    capacity: number;
    building: string;
    floor: number;
    equipment: string[];
    status: string;
}): RoomDto;
export declare function buildRoomsWhere(query: RoomsQuery): Prisma.AuditoryWhereInput;
export declare function getRoomsStats(prisma: PrismaClient): Promise<{
    total: number;
    available: number;
    booked: number;
    equipmentUnits: number;
}>;
export declare function getEquipmentOverview(prisma: PrismaClient): Promise<{
    key: string;
    label: string;
    count: number;
}[]>;
export declare function getBuildingSchema(prisma: PrismaClient, building?: string): Promise<{
    building: string;
    floors: {
        floor: number;
        rooms: {
            code: string;
            status: RoomStatus;
        }[];
        available: number;
        total: number;
    }[];
}>;
export declare function getRecentActivity(prisma: PrismaClient): Promise<{
    type: string;
    text: string;
    at: string;
}[]>;
//# sourceMappingURL=rooms.d.ts.map