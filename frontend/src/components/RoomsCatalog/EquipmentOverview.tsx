// src/components/RoomsCatalog/EquipmentOverview.tsx
import { Paper, Stack, Typography, Box } from "@mui/material";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import MicIcon from "@mui/icons-material/Mic";
import TvIcon from "@mui/icons-material/Tv";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const items = [
  { icon: HelpOutlineIcon, label: "Проекторы", value: 18, color: "#e0e7ff" },
  { icon: DesktopWindowsIcon, label: "Компьютеры", value: 45, color: "#dcfce7" },
  { icon: TvIcon, label: "Интер. доски", value: 12, color: "#f3e8ff" },
  { icon: MicIcon, label: "Микрофоны", value: 24, color: "#fef3c7" },
  { icon: CameraAltIcon, label: "Камеры", value: 8, color: "#fee2e2" },
  { icon: AcUnitIcon, label: "Кондиционеры", value: 16, color: "#fef9c7" },
];

function EquipmentOverview({ sx }: { sx?: any }) {
  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e5e7eb", ...sx }}>
      <Typography fontWeight={600} mb={3}>Обзор оборудования</Typography>
      <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
        {items.map((item) => (
          <Stack key={item.label} alignItems="center" spacing={1} sx={{ minWidth: 100 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: item.color,
                display: "grid",
                placeItems: "center",
                color: "#11181c",
              }}
            >
              <item.icon />
            </Box>
            <Typography variant="h6" fontWeight={600}>{item.value}</Typography>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
export default EquipmentOverview;