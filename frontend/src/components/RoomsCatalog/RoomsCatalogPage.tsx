import { useState } from "react";
import { Box } from "@mui/material";
import { RoomsTable } from "@/components/RoomsTable/RoomsTable";
import type { RoomsFilters } from "@/api/roomsApi";

import RoomsCatalogHeader from "./RoomsCatalogHeader";
import RoomsStatsCards from "./RoomsStatsCards";
import RoomsFilters, { EMPTY_FILTERS } from "./RoomsFilters";
import RoomsQuickActions from "./RoomsQuickActions";
import RecentChanges from "./RecentChanges";
import EquipmentOverview from "./EquipmentOverview";
import BuildingSchema from "./BuildingSchema";
import CatalogFooter from "./CatalogFooter";
import "./catalog.css";

export function RoomsCatalogPage() {
  const [filters, setFilters] = useState<RoomsFilters>({ ...EMPTY_FILTERS });

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", pb: 4, px: { xs: 1, sm: 2 } }}>
      <RoomsCatalogHeader />
      <RoomsStatsCards />

      <Box mt={4}>
        <RoomsFilters filters={filters} onChange={setFilters} />
      </Box>

      <Box mt={4}>
        <RoomsTable filters={filters} />
      </Box>

      <Box mt={4} className="catalog-two-col">
        <RoomsQuickActions />
        <RecentChanges />
      </Box>

      <Box mt={4}>
        <EquipmentOverview />
      </Box>

      <Box mt={4}>
        <BuildingSchema />
      </Box>

      <Box mt={4}>
        <CatalogFooter />
      </Box>
    </Box>
  );
}
