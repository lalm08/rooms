// src/components/RoomsCatalog/RoomsStatsCards.tsx

import { Paper, Stack, Typography } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

const RoomsStatsCards = () => {
  const cards = [
    { value: 24, label: "Всего аудиторий" },
    { value: 18, label: "Доступные сейчас", growth: true },
    { value: 6, label: "Забронированы" },
    { value: 156, label: "Единиц оборудования" },
  ];

  return (
    <Stack direction="row" spacing={3} useFlexGap>
      {cards.map((card) => (
        <Paper
          key={card.label}
          elevation={0}
          className={card.growth ? "stats-card success" : "stats-card"}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" fontWeight={700}>
              {card.value}
            </Typography>
            {card.growth && (
              <Stack direction="row" alignItems="center" color="#17c653" fontWeight={600}>
                <ArrowUpwardIcon fontSize="small" />
                <span>+12%</span>
              </Stack>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {card.label}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
};

export default RoomsStatsCards;   // ← ЭТО РАБОТАЕТ!