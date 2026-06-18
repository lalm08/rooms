import { useEffect, useState } from "react";
import { Paper, Stack, Typography, Box, CircularProgress } from "@mui/material";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import MicIcon from "@mui/icons-material/Mic";
import TvIcon from "@mui/icons-material/Tv";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { fetchEquipmentOverview } from "@/api/roomsApi";

const ICONS: Record<string, typeof HelpOutlineIcon> = {
  projector: HelpOutlineIcon,
  computers: DesktopWindowsIcon,
  board: TvIcon,
  microphone: MicIcon,
  camera: CameraAltIcon,
  ac: AcUnitIcon,
};

const COLORS: Record<string, string> = {
  projector: "#e0e7ff",
  computers: "#dcfce7",
  board: "#f3e8ff",
  microphone: "#fef3c7",
  camera: "#fee2e2",
  ac: "#fef9c7",
};

function EquipmentOverview() {
  const [items, setItems] = useState<Array<{ key: string; label: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchEquipmentOverview();
        if (mounted) setItems(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb" }}>
      <Typography fontWeight={600} mb={3}>Обзор оборудования</Typography>
      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 3 }}><CircularProgress size={28} /></Box>
      ) : (
        <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
          {items.map((item) => {
            const Icon = ICONS[item.key] ?? HelpOutlineIcon;
            return (
              <Stack key={item.key} alignItems="center" spacing={1} sx={{ minWidth: 100 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: COLORS[item.key] ?? "#f1f5f9",
                    display: "grid",
                    placeItems: "center",
                    color: "#11181c",
                  }}
                >
                  <Icon />
                </Box>
                <Typography variant="h6" fontWeight={600}>{item.count}</Typography>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  {item.label}
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

export default EquipmentOverview;
