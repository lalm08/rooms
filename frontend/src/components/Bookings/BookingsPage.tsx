import { useState } from "react";
import { Box } from "@mui/material";
import { EMPTY_BOOKING_FILTERS, type BookingDto } from "@/api/bookingsApi";
import RecentChanges from "@/components/RoomsCatalog/RecentChanges";
import "../RoomsCatalog/catalog.css";
import "./bookings.css";

import { BookingsHeader } from "./BookingsHeader";
import { BookingsStatsCards } from "./BookingsStatsCards";
import { BookingsFilters } from "./BookingsFilters";
import { OccupancyGrid } from "./OccupancyGrid";
import { BookingsTable } from "./BookingsTable";
import { UpcomingEvents } from "./UpcomingEvents";
import { BookingDialog } from "./BookingDialog";

export function BookingsPage() {
  const [filters, setFilters] = useState({ ...EMPTY_BOOKING_FILTERS });
  const [refreshKey, setRefreshKey] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BookingDto | null>(null);

  const refresh = () => setRefreshKey((k) => k + 1);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (booking: BookingDto) => {
    setEditing(booking);
    setDialogOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", pb: 4, px: { xs: 2, md: 3 } }}>
      <BookingsHeader onNewBooking={openCreate} />
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
          onEdit={openEdit}
          onChanged={refresh}
        />
      </Box>

      <Box mt={3} className="bookings-bottom-grid">
        <RecentChanges refreshKey={refreshKey} />
        <UpcomingEvents refreshKey={refreshKey} />
      </Box>

      <BookingDialog
        open={dialogOpen}
        booking={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={refresh}
      />
    </Box>
  );
}
