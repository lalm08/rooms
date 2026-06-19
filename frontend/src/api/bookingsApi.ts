import { http } from "./http";

export type BookingStatus = "draft" | "pending" | "confirmed" | "cancelled";

export interface BookingDetailsDto {
  eventType?: string;
  subject?: string;
  format?: string;
  prepMinutes?: string;
  cleanupMinutes?: string;
  recurring?: boolean;
  backupAuditoryId?: string;
  organizerPosition?: string;
  organizerPhone?: string;
  organizerDepartment?: string;
  organizerFaculty?: string;
  expectedParticipants?: string;
  participantType?: string;
  groups?: string[];
  specialRequirements?: string;
  equipment?: string[];
}

export interface BookingAuditoryDto {
  id: string;
  code: string;
  name: string;
  capacity: number;
  building: string;
  floor: number;
  status: string;
}

export interface BookingDto {
  id: string;
  displayId: string;
  auditoryId: string;
  deviceId: string | null;
  title: string;
  organizer: string;
  organizerEmail: string;
  note: string | null;
  description: string | null;
  details: BookingDetailsDto;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  createdAt: string;
  auditory: BookingAuditoryDto;
  device: { id: string; name: string } | null;
}

export interface BookingsResponseDto {
  items: BookingDto[];
  page: number;
  limit: number;
  total: number;
}

export interface BookingsFilters {
  search: string;
  status: string;
  date: string;
  auditoryId: string;
  organizer: string;
}

export interface BookingsStatsDto {
  total: number;
  activeToday: number;
  pending: number;
  cancelledThisWeek: number;
  hoursThisMonth: number;
  usagePercent: number;
}

export type OccupancyCell = "free" | "occupied" | "preparation" | "unavailable";

export interface OccupancyGridDto {
  date: string;
  hours: number[];
  rows: Array<{
    auditoryId: string;
    code: string;
    name: string;
    cells: OccupancyCell[];
  }>;
}

export interface CreateBookingPayload {
  auditoryId: string;
  deviceId?: string | null;
  title: string;
  description?: string;
  organizer: string;
  organizerEmail: string;
  note?: string;
  startAt: string;
  endAt: string;
  status?: BookingStatus;
  details?: BookingDetailsDto;
}

export const EMPTY_BOOKING_FILTERS: BookingsFilters = {
  search: "",
  status: "",
  date: "",
  auditoryId: "",
  organizer: "",
};

export async function fetchBookings(
  page = 1,
  filters: Partial<BookingsFilters> = {},
  limit = 15,
): Promise<BookingsResponseDto> {
  const params: Record<string, string | number> = { page, limit };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.date) params.date = filters.date;
  if (filters.auditoryId) params.auditoryId = filters.auditoryId;
  if (filters.organizer) params.organizer = filters.organizer;

  const { data } = await http.get<BookingsResponseDto>("/bookings", { params });
  return data;
}

export async function fetchBookingsStats(): Promise<BookingsStatsDto> {
  const { data } = await http.get<BookingsStatsDto>("/bookings/stats");
  return data;
}

export async function fetchOccupancyGrid(date?: string): Promise<OccupancyGridDto> {
  const { data } = await http.get<OccupancyGridDto>("/bookings/occupancy", {
    params: date ? { date } : undefined,
  });
  return data;
}

export async function fetchUpcomingBookings(): Promise<BookingDto[]> {
  const { data } = await http.get<BookingDto[]>("/bookings/upcoming");
  return data;
}

export async function fetchBookingOrganizers(): Promise<string[]> {
  const { data } = await http.get<string[]>("/bookings/organizers");
  return data;
}

export async function fetchBooking(id: string): Promise<BookingDto> {
  const { data } = await http.get<BookingDto>(`/bookings/${id}`);
  return data;
}

export async function createBooking(payload: CreateBookingPayload): Promise<BookingDto> {
  const { data } = await http.post<BookingDto>("/bookings", payload);
  return data;
}

export async function updateBooking(
  id: string,
  payload: Partial<CreateBookingPayload>,
): Promise<BookingDto> {
  const { data } = await http.put<BookingDto>(`/bookings/${id}`, payload);
  return data;
}

export async function deleteBooking(id: string): Promise<void> {
  await http.delete(`/bookings/${id}`);
}

export async function fetchAuditoriesForSelect(): Promise<
  Array<{ id: string; code: string; name: string; capacity: number }>
> {
  const { data } = await http.get<Array<{ id: string; code: string; name: string; capacity: number }>>(
    "/auditories",
  );
  return data;
}
