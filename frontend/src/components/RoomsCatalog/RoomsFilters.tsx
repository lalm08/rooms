import { useEffect, useState } from "react";
import { Paper, TextField, Typography, CircularProgress, Box, Stack } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import { fetchBuildings, fetchDevices, type RoomsFilters as RoomsFiltersType } from "@/api/roomsApi";

const FLOORS = [1, 2, 3, 4, 5];

const EMPTY_FILTERS: RoomsFiltersType = {
  search: "",
  building: "",
  floor: "",
  status: "",
  equipment: [],
};

type Props = {
  filters: RoomsFiltersType;
  onChange: (filters: RoomsFiltersType) => void;
};

function RoomsFilters({ filters, onChange }: Props) {
  const [buildings, setBuildings] = useState<string[]>([]);
  const [devices, setDevices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [b, d] = await Promise.all([fetchBuildings(), fetchDevices()]);
        if (mounted) {
          setBuildings(b);
          setDevices(d.map((x) => x.name));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleDevice = (name: string) => {
    const next = new Set(filters.equipment);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    onChange({ ...filters, equipment: [...next] });
  };

  return (
    <Paper elevation={0} className="filters-panel">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={600}>Фильтры и поиск</Typography>
        <button type="button" className="btn-text" onClick={() => onChange({ ...EMPTY_FILTERS })}>
          Сбросить все
        </button>
      </Stack>

      <div className="filters-row">
        <div className="search-field">
          <SearchOutlined className="search-icon" fontSize="small" />
          <TextField
            placeholder="Поиск по номеру или названию..."
            size="small"
            fullWidth
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            variant="outlined"
            InputProps={{ sx: { pl: 0.5 } }}
          />
        </div>
        <select
          className="filter-select"
          value={filters.building}
          onChange={(e) => onChange({ ...filters, building: e.target.value })}
          disabled={loading}
        >
          <option value="">Все корпуса</option>
          {buildings.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filters.floor}
          onChange={(e) => onChange({ ...filters, floor: e.target.value })}
        >
          <option value="">Все этажи</option>
          {FLOORS.map((f) => (
            <option key={f} value={String(f)}>{f} этаж</option>
          ))}
        </select>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
        >
          <option value="">Все статусы</option>
          <option value="available">Доступна</option>
          <option value="booked">Забронирована</option>
          <option value="maintenance">На обслуживании</option>
        </select>
      </div>

      {loading ? (
        <Box sx={{ py: 1 }}><CircularProgress size={20} /></Box>
      ) : devices.length > 0 ? (
        <div className="equipment-tags">
          {devices.map((name) => (
            <button
              key={name}
              type="button"
              className={`equip-tag${filters.equipment.includes(name) ? " active" : ""}`}
              onClick={() => toggleDevice(name)}
            >
              {name}
            </button>
          ))}
        </div>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Добавьте устройства в настройках, чтобы фильтровать по оборудованию
        </Typography>
      )}
    </Paper>
  );
}

export default RoomsFilters;
export { EMPTY_FILTERS };
