import { useEffect, useState } from "react";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import Groups2Outlined from "@mui/icons-material/Groups2Outlined";
import { fetchUpcomingBookings, type BookingDto } from "@/api/bookingsApi";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatUpcomingLabel(startAt: string) {
  const start = new Date(startAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const diff = (day.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff === 0) return "Сегодня";
  if (diff === 1) return "Завтра";
  return start.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function formatTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const t1 = start.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const t2 = end.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return `${t1} – ${t2}`;
}

type Props = {
  refreshKey?: number;
};

export function UpcomingEvents({ refreshKey = 0 }: Props) {
  const [items, setItems] = useState<BookingDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchUpcomingBookings();
        if (mounted) setItems(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [refreshKey]);

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>
      <Typography fontWeight={600} mb={2}>Предстоящие мероприятия</Typography>

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Нет предстоящих мероприятий</Typography>
      ) : (
        <div className="upcoming-grid">
          {items.map((b) => (
            <div key={b.id} className="upcoming-card">
              <div className="upcoming-card-header">
                <span className="upcoming-room">
                  <span className="upcoming-dot" />
                  {b.auditory.code}
                </span>
                <span className="upcoming-label">{formatUpcomingLabel(b.startAt)}</span>
              </div>
              <div className="upcoming-title">{b.title || b.auditory.name}</div>
              <div className="upcoming-meta">{formatTimeRange(b.startAt, b.endAt)}</div>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                <Groups2Outlined sx={{ fontSize: 14, color: "#94a3b8" }} />
                <span className="upcoming-meta">{b.auditory.capacity} чел.</span>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5 }}>
                <div className="organizer-avatar" style={{ width: 28, height: 28, fontSize: "0.65rem" }}>
                  {initials(b.organizer || "?")}
                </div>
                <span className="upcoming-meta">{b.organizer || "—"}</span>
              </Box>
            </div>
          ))}
        </div>
      )}
    </Paper>
  );
}
