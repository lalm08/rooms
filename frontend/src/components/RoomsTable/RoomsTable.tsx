import { useEffect, useState } from "react";
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Box, Stack, Typography,
  Checkbox, TablePagination,
} from "@mui/material";
import { Groups2Outlined, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { fetchRooms, type RoomDto, type RoomsFilters } from "@/api/roomsApi";
import { roomsPayload } from "@/mocks/data";

const STATUS_LABEL: Record<RoomDto["status"], string> = {
  available: "Доступна",
  booked: "Забронирована",
  maintenance: "На обслуживании",
};

function equipLabel(key: string) {
  return key;
}

function filterItemsLocally(items: RoomDto[], filters: RoomsFilters) {
  return items.filter((r) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!r.code.toLowerCase().includes(q) && !r.name.toLowerCase().includes(q)) return false;
    }
    if (filters.building && r.building !== filters.building) return false;
    if (filters.floor && r.floor !== Number(filters.floor)) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.equipment.length) {
      const hasAll = filters.equipment.every((eq) =>
        r.equipment.some((item) => item.toLowerCase() === eq.toLowerCase())
      );
      if (!hasAll) return false;
    }
    return true;
  });
}

type Props = {
  filters: RoomsFilters;
};

export function RoomsTable({ filters }: Props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RoomDto[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    setPage(0);
    setSelected(new Set());
  }, [filters]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchRooms(page + 1, filters, rowsPerPage);
        if (mounted) {
          setItems(data.items);
          setTotal(data.total);
        }
      } catch {
        if (mounted) {
          const filtered = filterItemsLocally(roomsPayload.items, filters);
          const start = page * rowsPerPage;
          setItems(filtered.slice(start, start + rowsPerPage));
          setTotal(filtered.length);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [filters, page, rowsPerPage]);

  const allSelected = items.length > 0 && items.every((r) => selected.has(r.id));
  const someSelected = items.some((r) => selected.has(r.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((r) => r.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  return (
    <Paper elevation={0} className="rooms-table-panel">
      <div className="rooms-table-header">
        <Typography fontWeight={600}>Список аудиторий</Typography>
      </div>

      {loading && items.length === 0 ? (
        <Box sx={{ p: 4, display: "grid", placeItems: "center" }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <>
          <Table size="small" className="rooms-table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell>
                  <span className="th-sort">Номер <ArrowUpward sx={{ fontSize: 14 }} /></span>
                </TableCell>
                <TableCell>Название</TableCell>
                <TableCell>Местоположение</TableCell>
                <TableCell>
                  <span className="th-sort">Вместимость <ArrowDownward sx={{ fontSize: 14 }} /></span>
                </TableCell>
                <TableCell>Оборудование</TableCell>
                <TableCell>Статус</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Аудитории не найдены
                  </TableCell>
                </TableRow>
              ) : items.map((r) => (
                <TableRow key={r.id} hover selected={selected.has(r.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selected.has(r.id)}
                      onChange={() => toggleOne(r.id)}
                    />
                  </TableCell>
                  <TableCell className="room-code">{r.code}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600} fontSize="0.875rem">{r.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.875rem">{r.building}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.floor} этаж</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Groups2Outlined sx={{ fontSize: 16, color: "#94a3b8" }} />
                      <span>{r.capacity}</span>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <div className="equip-pills">
                      {r.equipment.map((k) => (
                        <span key={k} className="equip-pill generic">
                          {equipLabel(k)}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`status-badge ${r.status}`}>
                      {STATUS_LABEL[r.status]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Показать по"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        </>
      )}
    </Paper>
  );
}
