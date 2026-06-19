import { useState } from "react";
import { Box } from "@mui/material";
import { RoomsTable } from "@/components/RoomsTable/RoomsTable";
import type { RoomsFilters as RoomsFiltersState } from "@/api/roomsApi";

import RoomsCatalogHeader from "./RoomsCatalogHeader";
import RoomsStatsCards from "./RoomsStatsCards";
import RoomsFilters, { EMPTY_FILTERS } from "./RoomsFilters";
import RecentChanges from "./RecentChanges";
import BuildingSchema from "./BuildingSchema";
import "./catalog.css";

export function RoomsCatalogPage({ onOpenSettings }: { onOpenSettings?: () => void }) {
  const [filters, setFilters] = useState<RoomsFiltersState>({ ...EMPTY_FILTERS });

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", pb: 4, px: { xs: 2, md: 3 } }}>
      <RoomsCatalogHeader onOpenSettings={onOpenSettings} />
      <RoomsStatsCards />

      <Box mt={3}>
        <RoomsFilters filters={filters} onChange={setFilters} />
      </Box>

      <Box mt={3}>
        <RoomsTable filters={filters} />
      </Box>

      <Box mt={3} className="catalog-bottom-grid">
        <RecentChanges />
        <BuildingSchema />
      </Box>
    </Box>
  );
}
