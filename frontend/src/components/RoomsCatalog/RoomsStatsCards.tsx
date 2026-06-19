import { useEffect, useState } from "react";
import { Paper, Stack, Typography, CircularProgress, Box } from "@mui/material";
import MeetingRoomOutlined from "@mui/icons-material/MeetingRoomOutlined";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import EventBusyOutlined from "@mui/icons-material/EventBusyOutlined";
import BuildOutlined from "@mui/icons-material/BuildOutlined";
import { fetchRoomsStats } from "@/api/roomsApi";

const RoomsStatsCards = () => {
  const [stats, setStats] = useState({ total: 0, available: 0, booked: 0, equipmentUnits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchRoomsStats();
        if (mounted) setStats(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const cards = [
    { value: stats.total, label: "Всего аудиторий", icon: MeetingRoomOutlined, iconClass: "blue" },
    { value: stats.available, label: "Доступные сейчас", icon: CheckCircleOutline, iconClass: "green" },
    { value: stats.booked, label: "Забронированы", icon: EventBusyOutlined, iconClass: "orange" },
    { value: stats.equipmentUnits, label: "Единиц оборудования", icon: BuildOutlined, iconClass: "purple" },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <Paper key={card.label} elevation={0} className="stats-card-v2">
          <Stack direction="row" spacing={2} alignItems="center">
            <div className={`stats-icon-box ${card.iconClass}`}>
              <card.icon fontSize="small" />
            </div>
            <Box>
              <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}
    </div>
  );
};

export default RoomsStatsCards;
