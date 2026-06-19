import { useEffect, useState } from "react";
import { Paper, Stack, Typography, CircularProgress, Box } from "@mui/material";
import EventNoteOutlined from "@mui/icons-material/EventNoteOutlined";
import TodayOutlined from "@mui/icons-material/TodayOutlined";
import HourglassEmptyOutlined from "@mui/icons-material/HourglassEmptyOutlined";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import { fetchBookingsStats } from "@/api/bookingsApi";

type Props = {
  refreshKey?: number;
};

export function BookingsStatsCards({ refreshKey = 0 }: Props) {
  const [stats, setStats] = useState({
    total: 0,
    activeToday: 0,
    pending: 0,
    cancelledThisWeek: 0,
    hoursThisMonth: 0,
    usagePercent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchBookingsStats();
        if (mounted) setStats(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [refreshKey]);

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  const cards = [
    { value: stats.total, label: "Всего бронирований", icon: EventNoteOutlined, iconClass: "blue", badge: null },
    { value: stats.activeToday, label: "Активных сегодня", icon: TodayOutlined, iconClass: "green", badge: "Сегодня" },
    { value: stats.pending, label: "Требуют подтверждения", icon: HourglassEmptyOutlined, iconClass: "orange", badge: "Ожидание" },
    { value: stats.cancelledThisWeek, label: "Отменено за неделю", icon: CancelOutlined, iconClass: "red", badge: "Отменены" },
    { value: stats.hoursThisMonth, label: "Часов за месяц", icon: ScheduleOutlined, iconClass: "purple", badge: `${stats.usagePercent}%` },
  ];

  return (
    <div className="stats-grid-5">
      {cards.map((card) => (
        <Paper key={card.label} elevation={0} className="stats-card-v2">
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <div className={`stats-icon-box ${card.iconClass}`}>
              <card.icon fontSize="small" />
            </div>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                  {card.value}
                </Typography>
                {card.badge && (
                  <span className={`stats-badge ${card.iconClass}`}>{card.badge}</span>
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {card.label}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      ))}
    </div>
  );
}
