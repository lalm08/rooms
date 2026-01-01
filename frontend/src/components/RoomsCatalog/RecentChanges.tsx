// src/components/RoomsCatalog/RecentChanges.tsx
import { Paper, Stack, Typography, Box } from "@mui/material";
import { Add, Edit, CalendarToday } from "@mui/icons-material";

const changes = [
  { icon: Add, color: "#10b981", text: "Добавлена аудитория 301", time: "2 часа назад" },
  { icon: Edit, color: "#3b82f6", text: "Обновлено оборудование в аудитории 201", time: "4 часа назад" },
  { icon: CalendarToday, color: "#f59e0b", text: "Создано бронирование для аудитории 102", time: "6 часов назад" },
];

function RecentChanges({ sx }: { sx?: any }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb", ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={600}>Последние изменения</Typography>
        <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }}>
          Показать все
        </Typography>
      </Stack>
      <Stack spacing={2}>
        {changes.map((c, i) => (
          <Stack key={i} direction="row" alignItems="center" spacing={2}>
            <Box sx={{ color: c.color }}>
              <c.icon />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">{c.text}</Typography>
              <Typography variant="caption" color="text.secondary">{c.time}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
export default RecentChanges;