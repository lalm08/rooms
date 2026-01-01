// src/components/RoomsCatalog/RoomsQuickActions.tsx
import { Paper, Stack, Typography } from "@mui/material";

function RoomsQuickActions({ sx }: { sx?: any }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb", ...sx }}>
      <Typography fontWeight={600} mb={2}>
        Быстрые действия
      </Typography>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <button className="action-btn primary">
          + Добавить аудиторию
          <br />
          <span className="sub">Создать новую аудиторию</span>
        </button>

        <button className="action-btn success">
          Создать бронирование
          <br />
          <span className="sub">Забронировать аудиторию</span>
        </button>

        <button className="action-btn warning">
          Массовое редактирование
          <br />
          <span className="sub">Изменить несколько аудиторий</span>
        </button>
      </Stack>
    </Paper>
  );
}
export default RoomsQuickActions;