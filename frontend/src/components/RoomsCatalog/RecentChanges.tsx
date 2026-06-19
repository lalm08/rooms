import { useEffect, useState } from "react";
import { Paper, Stack, Typography, Box, CircularProgress } from "@mui/material";
import { Add, Edit, CalendarToday } from "@mui/icons-material";
import { fetchRecentActivity } from "@/api/roomsApi";

const ICONS: Record<string, { icon: typeof Add; color: string }> = {
  add: { icon: Add, color: "#10b981" },
  edit: { icon: Edit, color: "#3b82f6" },
  booking: { icon: CalendarToday, color: "#f59e0b" },
};

function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "только что";
  if (hours < 24) return `${hours} ч. назад`;
  const days = Math.floor(hours / 24);
  return `${days} дн. назад`;
}

function RecentChanges({ refreshKey = 0 }: { refreshKey?: number }) {
  const [changes, setChanges] = useState<Array<{ type: string; text: string; at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchRecentActivity();
        if (mounted) setChanges(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [refreshKey]);

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb", height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={600}>Последние изменения</Typography>
        <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }}>
          Показать все
        </Typography>
      </Stack>
      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 3 }}><CircularProgress size={24} /></Box>
      ) : (
        <Stack spacing={2}>
          {changes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">Нет недавних изменений</Typography>
          ) : changes.map((c, i) => {
            const meta = ICONS[c.type] ?? ICONS.edit;
            const Icon = meta.icon;
            return (
              <Stack key={i} direction="row" alignItems="center" spacing={2}>
                <Box sx={{ color: meta.color }}><Icon /></Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{c.text}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatRelativeTime(c.at)}</Typography>
                </Box>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

export default RecentChanges;
