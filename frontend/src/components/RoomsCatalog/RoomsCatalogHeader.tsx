// src/components/RoomsCatalog/RoomsCatalogHeader.tsx
import { Stack, Typography } from "@mui/material";

function RoomsCatalogHeader() {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"   // ← было flex-end → теперь center
      mb={4}
    >
      <div>
        <Typography variant="h5" fontWeight={700} color="#11181c">
          Каталог аудиторий
        </Typography>
        <Typography variant="body2" color="#6b7280" mt={0.5}>
          Управляйте информацией об аудиториях, их оборудованием и местоположением
        </Typography>
      </div>

      <Stack direction="row" spacing={1.5}>
        <button className="header-btn outline">Экспорт JSON</button>
        <button className="header-btn outline">Импорт JSON</button>
        <button className="header-btn primary">+ Добавить аудиторию</button>
      </Stack>
    </Stack>
  );
}
export default RoomsCatalogHeader;