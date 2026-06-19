import { useState } from "react";
import { Box } from "@mui/material";
import { EMPTY_BOOKING_FILTERS } from "@/api/bookingsApi";
import RecentChanges from "@/components/RoomsCatalog/RecentChanges";
import "../RoomsCatalog/catalog.css";
import "./bookings.css";

import { BookingsHeader } from "./BookingsHeader";
import { BookingsStatsCards } from "./BookingsStatsCards";
import { BookingsFilters } from "./BookingsFilters";
import { OccupancyGrid } from "./OccupancyGrid";
import { BookingsTable } from "./BookingsTable";
import { UpcomingEvents } from "./UpcomingEvents";
import { NewBookingPage } from "./NewBookingPage";

type View = "list" | "create" | "edit";

export function BookingsPage() {
  const [view, setView] = useState<View>("list");
  const [editId, setEditId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ ...EMPTY_BOOKING_FILTERS });
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  const goList = () => {
    setView("list");
    setEditId(null);
    refresh();
  };

  if (view === "create") {
    return <NewBookingPage onBack={goList} onSaved={goList} />;
  }

  if (view === "edit" && editId) {
    return <NewBookingPage bookingId={editId} onBack={goList} onSaved={goList} />;
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", pb: 4, px: { xs: 2, md: 3 } }}>
      <BookingsHeader onNewBooking={() => setView("create")} />
      <BookingsStatsCards refreshKey={refreshKey} />

      <Box mt={3}>
        <BookingsFilters filters={filters} onChange={setFilters} />
      </Box>

      <Box mt={3}>
        <OccupancyGrid refreshKey={refreshKey} />
      </Box>

      <Box mt={3}>
        <BookingsTable
          filters={filters}
          refreshKey={refreshKey}
          onEdit={(b) => {
            setEditId(b.id);
            setView("edit");
          }}
          onChanged={refresh}
        />
      </Box>

      <Box mt={3} className="bookings-bottom-grid">
        <RecentChanges refreshKey={refreshKey} />
        <UpcomingEvents refreshKey={refreshKey} />
      </Box>
    </Box>
  );
}
