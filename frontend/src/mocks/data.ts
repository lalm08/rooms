import type { RoomsResponseDto } from "@/api/roomsApi";

export const roomsPayload: RoomsResponseDto = {
  items: [
    {
      id: "1", code: "101", name: "Лекционная аудитория",
      building: "Главный корпус", floor: 1, capacity: 120,
      equipment: ["projector", "microphone", "wifi"], status: "available",
    },
    {
      id: "2", code: "102", name: "Компьютерный класс",
      building: "Главный корпус", floor: 1, capacity: 30,
      equipment: ["computers", "projector", "wifi", "board"], status: "booked",
    },
    {
      id: "3", code: "201", name: "Конференц-зал",
      building: "Главный корпус", floor: 2, capacity: 50,
      equipment: ["projector", "microphone", "wifi", "video", "ac"], status: "available",
    },
    {
      id: "4", code: "202", name: "Семинарская аудитория",
      building: "Главный корпус", floor: 2, capacity: 25,
      equipment: ["board", "wifi"], status: "maintenance",
    },
  ],
  page: 1,
  limit: 10,
  total: 24,
};
