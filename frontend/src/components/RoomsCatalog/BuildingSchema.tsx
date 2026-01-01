import { Paper, Stack, Typography } from "@mui/material";

const floors = [
  { floor: 4, rooms: ["401", "402", "403", "404"], booked: ["402"] },
  { floor: 3, rooms: ["301", "302", "303", "304"], booked: [] },
  { floor: 2, rooms: ["201", "202", "203", "204"], booked: ["202"] },
  { floor: 1, rooms: ["101", "102", "103", "104"], booked: ["102"] },
];

function BuildingSchema() {
  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid #e0e0e0" }}>
      <Stack direction="row" spacing={8}>
        <div style={{ flex: 1 }}>
          <Typography fontWeight={600} textAlign="center" mb={3}>Главный корпус</Typography>
          {floors.map(f => (
            <Stack key={f.floor} direction="row" spacing={2} alignItems="center" mb={3}>
              <Typography width={70} color="text.secondary">{f.floor} этаж</Typography>
              <div style={{ display: "flex", gap: 12 }}>
                {f.rooms.map(room => (
                  <div
                    key={room}
                    className={`room-box ${f.booked.includes(room) ? "booked" : "available"}`}
                  >
                    {room}
                  </div>
                ))}
              </div>
            </Stack>
          ))}
        </div>

        <Stack spacing={4}>
          <div>
            <Typography fontWeight={600}>Легенда</Typography>
            <div className="legend">
              <div><span className="legend-color available"></span> Доступна</div>
              <div><span className="legend-color booked"></span> Забронирована</div>
              <div><span className="legend-color maintenance"></span> На обслуживании</div>
            </div>
          </div>
          <div>
            <Typography fontWeight={600}>Статистика по этажам</Typography>
            {floors.map(f => (
              <div key={f.floor} className="floor-stat">
                <span>{f.floor} этаж</span>
                <span>{f.rooms.length - f.booked.length}/{f.rooms.length} доступно</span>
              </div>
            ))}
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
}
export default BuildingSchema;