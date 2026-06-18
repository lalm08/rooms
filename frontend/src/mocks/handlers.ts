import { http as msw, HttpResponse } from "msw";
import { roomsPayload } from "./data";

const stats = {
  total: roomsPayload.items.length,
  available: roomsPayload.items.filter((r) => r.status === "available").length,
  booked: roomsPayload.items.filter((r) => r.status === "booked").length,
  equipmentUnits: roomsPayload.items.reduce((s, r) => s + r.equipment.length, 0),
};

export const handlers = [
  msw.get("/api/rooms", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    let items = [...roomsPayload.items];

    const search = url.searchParams.get("search");
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((r) => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
    }

    const status = url.searchParams.get("status");
    if (status) items = items.filter((r) => r.status === status);

    const total = items.length;
    const start = (page - 1) * limit;
    items = items.slice(start, start + limit);

    return HttpResponse.json({ items, page, limit, total });
  }),

  msw.get("/api/rooms/stats", () => HttpResponse.json(stats)),

  msw.get("/api/rooms/buildings", () => HttpResponse.json(["Главный корпус"])),

  msw.get("/api/rooms/schema", () =>
    HttpResponse.json({
      building: "Главный корпус",
      floors: [
        { floor: 2, rooms: roomsPayload.items.map((r) => ({ code: r.code, status: r.status })), available: 2, total: 4 },
      ],
    })
  ),

  msw.get("/api/equipment/overview", () =>
    HttpResponse.json([
      { key: "projector", label: "Проекторы", count: 3 },
      { key: "computers", label: "Компьютеры", count: 2 },
    ])
  ),

  msw.get("/api/activity/recent", () =>
    HttpResponse.json([
      { type: "add", text: "Добавлена аудитория 301", at: new Date().toISOString() },
    ])
  ),
];
