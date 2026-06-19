import { http } from "./http";

export type RoomStatus = "available" | "booked" | "maintenance";

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

export interface RoomsResponseDto {
  items: RoomDto[];
  page: number;
  limit: number;
  total: number;
}

export interface RoomsFilters {
  search: string;
  building: string;
  floor: string;
  status: string;
  equipment: string[];
}

export interface RoomsStatsDto {
  total: number;
  available: number;
  booked: number;
  equipmentUnits: number;
}

export interface EquipmentItemDto {
  key: string;
  label: string;
  count: number;
}

export interface BuildingSchemaDto {
  building: string;
  floors: Array<{
    floor: number;
    rooms: Array<{ code: string; status: RoomStatus }>;
    available: number;
    total: number;
  }>;
}

export interface ActivityItemDto {
  type: string;
  text: string;
  at: string;
}

export const EQUIPMENT_TAG_MAP: Record<string, string> = {
  Проектор: "projector",
  Компьютеры: "computers",
  "Интерактивная доска": "board",
  Микрофон: "microphone",
  "Wi-Fi": "wifi",
};

export async function fetchDevices(): Promise<Array<{ id: string; name: string }>> {
  const { data } = await http.get<Array<{ id: string; name: string }>>("/devices");
  return data;
}

export async function fetchRooms(
  page = 1,
  filters: Partial<RoomsFilters> = {},
  limit = 10,
): Promise<RoomsResponseDto> {
  const params: Record<string, string | number> = { page, limit };
  if (filters.search) params.search = filters.search;
  if (filters.building) params.building = filters.building;
  if (filters.floor) params.floor = filters.floor;
  if (filters.status) params.status = filters.status;
  if (filters.equipment?.length) params.equipment = filters.equipment.join(",");

  const { data } = await http.get<RoomsResponseDto>("/rooms", { params });
  return data;
}

export async function fetchRoomsStats(): Promise<RoomsStatsDto> {
  const { data } = await http.get<RoomsStatsDto>("/rooms/stats");
  return data;
}

export async function fetchBuildings(): Promise<string[]> {
  const { data } = await http.get<string[]>("/rooms/buildings");
  return data;
}

export async function fetchBuildingSchema(building?: string): Promise<BuildingSchemaDto> {
  const { data } = await http.get<BuildingSchemaDto>("/rooms/schema", {
    params: building ? { building } : undefined,
  });
  return data;
}

export async function fetchEquipmentOverview(): Promise<EquipmentItemDto[]> {
  const { data } = await http.get<EquipmentItemDto[]>("/equipment/overview");
  return data;
}

export async function fetchRecentActivity(): Promise<ActivityItemDto[]> {
  const { data } = await http.get<ActivityItemDto[]>("/activity/recent");
  return data;
}
