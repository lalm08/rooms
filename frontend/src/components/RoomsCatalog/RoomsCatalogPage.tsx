// src/components/RoomsCatalog/RoomsCatalogPage.tsx
import { Box } from "@mui/material";
import { RoomsTable } from "@/components/RoomsTable/RoomsTable";

import RoomsCatalogHeader from "./RoomsCatalogHeader";
import RoomsStatsCards from "./RoomsStatsCards";
import RoomsFilters from "./RoomsFilters";
import RoomsQuickActions from "./RoomsQuickActions";
import RecentChanges from "./RecentChanges";
import EquipmentOverview from "./EquipmentOverview";
import BuildingSchema from "./BuildingSchema";

export function RoomsCatalogPage() {
  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", pb: 8 }}>
      {/* Заголовок */}
      <RoomsCatalogHeader />

      {/* 1. Статистика */}
      <RoomsStatsCards />

      {/* 2. Фильтры и поиск */}
      <Box mt={4}>
        <RoomsFilters />
      </Box>

      {/* 3. Список аудиторий */}
      <Box mt={4}>
        <RoomsTable />
      </Box>

      {/* 4. Быстрые действия */}
      <Box mt={4}>
        <RoomsQuickActions />
      </Box>

      {/* 5. Последние изменения */}
      <Box mt={4}>
        <RecentChanges />
      </Box>

      {/* 6. Обзор оборудования */}
      <Box mt={4}>
        <EquipmentOverview />
      </Box>

      {/* 7. Схема корпуса */}
      <Box mt={4}>
        <BuildingSchema />
      </Box>
    </Box>
  );
}