import { useEffect, useState } from "react";
import { Paper, TextField, Typography, CircularProgress, Box, Stack } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import {
  EQUIPMENT_TAG_MAP,
  fetchBuildings,
  type RoomsFilters as RoomsFiltersType,
} from "@/api/roomsApi";

const EQUIPMENT_TAGS = Object.keys(EQUIPMENT_TAG_MAP);

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
  const [loadingBuildings, setLoadingBuildings] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchBuildings();
        if (mounted) setBuildings(data);
      } finally {
        if (mounted) setLoadingBuildings(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleTag = (tag: string) => {
    const key = EQUIPMENT_TAG_MAP[tag];
    const next = new Set(filters.equipment);
    if (next.has(key)) next.delete(key);
    else next.add(key);
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
          disabled={loadingBuildings}
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
          {[1, 2, 3, 4].map((f) => (
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

      {loadingBuildings ? (
        <Box sx={{ py: 1 }}><CircularProgress size={20} /></Box>
      ) : (
        <div className="equipment-tags">
          {EQUIPMENT_TAGS.map((tag) => {
            const key = EQUIPMENT_TAG_MAP[tag];
            const active = filters.equipment.includes(key);
            return (
              <button
                key={tag}
                type="button"
                className={`equip-tag${active ? " active" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </Paper>
  );
}

export default RoomsFilters;
export { EMPTY_FILTERS };
