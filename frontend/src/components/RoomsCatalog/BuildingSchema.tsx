import { useEffect, useState } from "react";
import { Paper, Stack, Typography, Box, CircularProgress } from "@mui/material";
import { fetchBuildingSchema, type BuildingSchemaDto } from "@/api/roomsApi";

function BuildingSchema() {
  const [schema, setSchema] = useState<BuildingSchemaDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchBuildingSchema();
        if (mounted) setSchema(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid #e0e0e0" }}>
        <Box sx={{ display: "grid", placeItems: "center", py: 4 }}><CircularProgress /></Box>
      </Paper>
    );
  }

  if (!schema) return null;

  return (
    <Paper elevation={0} sx={{ p: 4, borderRadius: 2, border: "1px solid #e0e0e0" }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
        <Box sx={{ flex: 1 }}>
          <Typography fontWeight={600} textAlign="center" mb={3}>{schema.building}</Typography>
          {schema.floors.map((f) => (
            <Stack key={f.floor} direction="row" spacing={2} alignItems="center" mb={3}>
              <Typography width={70} color="text.secondary">{f.floor} этаж</Typography>
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {f.rooms.map((room) => (
                  <div key={room.code} className={`room-box ${room.status}`}>
                    {room.code}
                  </div>
                ))}
              </Box>
            </Stack>
          ))}
        </Box>

        <Stack spacing={4} sx={{ minWidth: 220 }}>
          <div>
            <Typography fontWeight={600}>Легенда</Typography>
            <div className="legend">
              <div><span className="legend-color available" /> Доступна</div>
              <div><span className="legend-color booked" /> Забронирована</div>
              <div><span className="legend-color maintenance" /> На обслуживании</div>
            </div>
          </div>
          <div>
            <Typography fontWeight={600}>Статистика по этажам</Typography>
            {schema.floors.map((f) => (
              <div key={f.floor} className="floor-stat">
                <span>{f.floor} этаж</span>
                <span>{f.available}/{f.total} доступно</span>
              </div>
            ))}
          </div>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default BuildingSchema;
