import { useEffect, useState } from "react";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import { fetchOccupancyGrid, type OccupancyCell, type OccupancyGridDto } from "@/api/bookingsApi";

const LEGEND: Array<{ key: OccupancyCell; label: string }> = [
  { key: "free", label: "Свободно" },
  { key: "occupied", label: "Занято" },
  { key: "preparation", label: "Подготовка" },
  { key: "unavailable", label: "Недоступно" },
];

function formatHour(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

type Props = {
  refreshKey?: number;
};

export function OccupancyGrid({ refreshKey = 0 }: Props) {
  const [grid, setGrid] = useState<OccupancyGridDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchOccupancyGrid();
        if (mounted) setGrid(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [refreshKey]);

  return (
    <Paper elevation={0} className="occupancy-panel">
      <Typography fontWeight={600} mb={2}>Сетка занятости аудиторий</Typography>

      <div className="occupancy-legend">
        {LEGEND.map((item) => (
          <span key={item.key}>
            <span className={`occ-dot ${item.key}`} />
            {item.label}
          </span>
        ))}
      </div>

      {loading ? (
        <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !grid || grid.rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Нет аудиторий для отображения</Typography>
      ) : (
        <>
          <div className="occupancy-grid-header">
            <div />
            {grid.hours.map((h) => (
              <div key={h} className="occupancy-hour">{formatHour(h)}</div>
            ))}
          </div>
          {grid.rows.map((row) => (
            <div key={row.auditoryId} className="occupancy-row">
              <div className="occupancy-room-label">
                <strong>{row.code}</strong>
                <span>{row.name}</span>
              </div>
              {row.cells.map((cell, i) => (
                <div key={i} className={`occ-cell ${cell}`} title={LEGEND.find((l) => l.key === cell)?.label} />
              ))}
            </div>
          ))}
        </>
      )}
    </Paper>
  );
}
