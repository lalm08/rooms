import { useEffect, useState } from "react";
import { Paper, TextField, Typography, Stack } from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import {
  EMPTY_BOOKING_FILTERS,
  fetchAuditoriesForSelect,
  fetchBookingOrganizers,
  type BookingsFilters as BookingsFiltersType,
} from "@/api/bookingsApi";

type Props = {
  filters: BookingsFiltersType;
  onChange: (filters: BookingsFiltersType) => void;
};

export function BookingsFilters({ filters, onChange }: Props) {
  const [auditories, setAuditories] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [organizers, setOrganizers] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rooms, orgs] = await Promise.all([
          fetchAuditoriesForSelect(),
          fetchBookingOrganizers(),
        ]);
        if (mounted) {
          setAuditories(rooms);
          setOrganizers(orgs);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Paper elevation={0} className="filters-panel">
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography fontWeight={600}>Фильтры и поиск</Typography>
        <button type="button" className="btn-text" onClick={() => onChange({ ...EMPTY_BOOKING_FILTERS })}>
          Сбросить все
        </button>
      </Stack>

      <div className="filters-row">
        <div className="search-field">
          <SearchOutlined className="search-icon" fontSize="small" />
          <TextField
            placeholder="Поиск по названию, номеру..."
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
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
        >
          <option value="">Все статусы</option>
          <option value="draft">Черновик</option>
          <option value="confirmed">Подтверждено</option>
          <option value="pending">Ожидает подтверждения</option>
          <option value="cancelled">Отменено</option>
        </select>

        <select
          className="filter-select"
          value={filters.date}
          onChange={(e) => onChange({ ...filters, date: e.target.value })}
        >
          <option value="">Все даты</option>
          <option value="today">Сегодня</option>
          <option value="week">Эта неделя</option>
          <option value="month">Этот месяц</option>
        </select>

        <select
          className="filter-select"
          value={filters.auditoryId}
          onChange={(e) => onChange({ ...filters, auditoryId: e.target.value })}
        >
          <option value="">Все аудитории</option>
          {auditories.map((a) => (
            <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.organizer}
          onChange={(e) => onChange({ ...filters, organizer: e.target.value })}
        >
          <option value="">Все организаторы</option>
          {organizers.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    </Paper>
  );
}
