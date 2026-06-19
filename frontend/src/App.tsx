import { useState } from "react";
import { Box } from "@mui/material";

import { Header } from "./components/Header";
import { RoomsCatalogPage } from "./components/RoomsCatalog/RoomsCatalogPage";
import { SettingsPage } from "./pages/SettingsPage";
import { BookingsPlaceholder } from "./pages/BookingsPlaceholder";

type NavId = "catalog" | "bookings" | "settings";

export default function App() {
  const [activeNav, setActiveNav] = useState<NavId>("catalog");

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <Header
        activeNavId={activeNav}
        onNavigate={(id) => setActiveNav(id as NavId)}
      />

      {activeNav === "catalog" && (
        <Box sx={{ pt: 3, pb: 6 }}>
          <RoomsCatalogPage />
        </Box>
      )}

      {activeNav === "bookings" && <BookingsPlaceholder />}

      {activeNav === "settings" && <SettingsPage />}
    </Box>
  );
}
