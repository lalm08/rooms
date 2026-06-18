import { useEffect, useState } from "react";
import { Paper, Stack, Typography, CircularProgress, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
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
    { value: stats.total, label: "Всего аудиторий", growth: stats.total > 0 },
    { value: stats.available, label: "Доступные сейчас", variant: "success" as const, badge: "Активно", badgeClass: "green" },
    { value: stats.booked, label: "Забронированы", variant: "warning" as const, badge: "Занято", badgeClass: "orange" },
    { value: stats.equipmentUnits, label: "Единиц оборудования", variant: "info" as const, badge: "Обновлено", badgeClass: "blue" },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <Paper
          key={card.label}
          elevation={0}
          className={card.variant ? `stats-card ${card.variant}` : "stats-card"}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h4" fontWeight={700}>
              {card.value}
            </Typography>
            {card.growth && card.label === "Всего аудиторий" && (
              <span className="stats-growth">
                <ArrowUpwardIcon fontSize="small" />
                +12%
              </span>
            )}
            {card.badge && (
              <span className={`stats-badge ${card.badgeClass}`}>{card.badge}</span>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {card.label}
          </Typography>
        </Paper>
      ))}
    </div>
  );
};

export default RoomsStatsCards;
