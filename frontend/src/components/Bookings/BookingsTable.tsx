import { useEffect, useState } from "react";
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, Box, IconButton, Stack, Typography,
  Checkbox, TablePagination,
} from "@mui/material";
import {
  EditOutlined, DeleteOutline, CheckCircleOutline,
  Groups2Outlined, ArrowUpward,
} from "@mui/icons-material";
import {
  fetchBookings,
  updateBooking,
  deleteBooking,
  type BookingDto,
  type BookingsFilters,
} from "@/api/bookingsApi";

const STATUS_LABEL: Record<BookingDto["status"], string> = {
  draft: "Черновик",
  confirmed: "Подтверждено",
  pending: "Ожидает подтверждения",
  cancelled: "Отменено",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatDateTimeRange(startAt: string, endAt: string) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const date = start.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  const t1 = start.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const t2 = end.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  return `${date} ${t1}–${t2}`;
}

type Props = {
  filters: BookingsFilters;
  refreshKey?: number;
  onEdit: (booking: BookingDto) => void;
  onChanged: () => void;
};

export function BookingsTable({ filters, refreshKey = 0, onEdit, onChanged }: Props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<BookingDto[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
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
        const data = await fetchBookings(page + 1, filters, rowsPerPage);
        if (mounted) {
          setItems(data.items);
          setTotal(data.total);
        }
      } catch {
        if (mounted) {
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [filters, page, rowsPerPage, refreshKey]);

  const allSelected = items.length > 0 && items.every((b) => selected.has(b.id));
  const someSelected = items.some((b) => selected.has(b.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((b) => b.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleConfirm = async (id: string) => {
    await updateBooking(id, { status: "confirmed" });
    onChanged();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Удалить бронирование?")) return;
    await deleteBooking(id);
    onChanged();
  };

  return (
    <Paper elevation={0} className="rooms-table-panel">
      <div className="rooms-table-header">
        <Typography fontWeight={600}>Список бронирований</Typography>
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
                  <span className="th-sort">ID <ArrowUpward sx={{ fontSize: 14 }} /></span>
                </TableCell>
                <TableCell>Аудитория</TableCell>
                <TableCell>Дата и время</TableCell>
                <TableCell>Организатор</TableCell>
                <TableCell>Мероприятие</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    Бронирования не найдены
                  </TableCell>
                </TableRow>
              ) : items.map((b) => (
                <TableRow key={b.id} hover selected={selected.has(b.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={selected.has(b.id)}
                      onChange={() => toggleOne(b.id)}
                    />
                  </TableCell>
                  <TableCell className="room-code">#{b.displayId}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600} fontSize="0.875rem">{b.auditory.code}</Typography>
                    <Typography variant="caption" color="text.secondary">{b.auditory.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontSize="0.875rem">{formatDateTimeRange(b.startAt, b.endAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <div className="organizer-cell">
                      <div className="organizer-avatar">{initials(b.organizer || "?")}</div>
                      <Box>
                        <Typography fontSize="0.875rem" fontWeight={500}>
                          {b.organizer || "—"}
                        </Typography>
                        {b.organizerEmail && (
                          <Typography variant="caption" color="text.secondary">{b.organizerEmail}</Typography>
                        )}
                      </Box>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} fontSize="0.875rem">{b.title || "—"}</Typography>
                    {b.note && (
                      <Typography variant="caption" color="text.secondary">{b.note}</Typography>
                    )}
                    {!b.note && b.auditory.capacity > 0 && (
                      <Stack direction="row" spacing={0.5} alignItems="center" mt={0.25}>
                        <Groups2Outlined sx={{ fontSize: 14, color: "#94a3b8" }} />
                        <Typography variant="caption" color="text.secondary">
                          {b.auditory.capacity} чел.
                        </Typography>
                      </Stack>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`booking-status ${b.status}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0} justifyContent="center">
                      <IconButton size="small" title="Редактировать" onClick={() => onEdit(b)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                      {b.status === "pending" && (
                        <IconButton size="small" title="Подтвердить" onClick={() => handleConfirm(b.id)}>
                          <CheckCircleOutline fontSize="small" color="success" />
                        </IconButton>
                      )}
                      <IconButton size="small" color="error" title="Удалить" onClick={() => handleDelete(b.id)}>
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Stack>
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
            rowsPerPageOptions={[15, 25, 50]}
            labelRowsPerPage="Показать по"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        </>
      )}
    </Paper>
  );
}
