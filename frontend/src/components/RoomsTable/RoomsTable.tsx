import { useEffect, useState } from "react";
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, CircularProgress, Box, IconButton, Stack, Typography,
  TablePagination,
} from "@mui/material";
import { VisibilityOutlined, EditOutlined, DeleteOutline, Groups2Outlined } from "@mui/icons-material";
import { fetchRooms, type RoomDto, type RoomsFilters } from "@/api/roomsApi";
import { roomsPayload } from "@/mocks/data";

const STATUS_LABEL: Record<RoomDto["status"], string> = {
  available: "Доступна",
  booked: "Забронирована",
  maintenance: "На обслуживании",
};
const STATUS_COLOR: Record<RoomDto["status"], "success" | "warning" | "default"> = {
  available: "success",
  booked: "warning",
  maintenance: "default",
};
const EQUIP_LABEL: Record<string, string> = {
  projector: "Проектор", microphone: "Микрофон", wifi: "Wi-Fi",
  computers: "Компьютеры", board: "Доска",
};

type Props = {
  filters: RoomsFilters;
};

export function RoomsTable({ filters }: Props) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RoomDto[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setPage(0);
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
      } catch (e) {
        if (mounted) {
          console.warn("API /rooms недоступен, используем демо-данные:", e);
          setItems(roomsPayload.items);
          setTotal(roomsPayload.total);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [filters, page, rowsPerPage]);

  if (loading && items.length === 0) {
    return <Box sx={{ p: 3, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #eef0f3" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={100}>Номер</TableCell>
            <TableCell>Название</TableCell>
            <TableCell width={160}>Расположение</TableCell>
            <TableCell width={120} align="right">Вместимость</TableCell>
            <TableCell>Оборудование</TableCell>
            <TableCell width={170}>Статус</TableCell>
            <TableCell width={120} align="center">Действия</TableCell>
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
            <TableRow key={r.id} hover>
              <TableCell sx={{ color: "text.secondary" }}>{r.code}</TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography fontWeight={600}>{r.name}</Typography>
                  {r.description && (
                    <Typography variant="caption" color="text.secondary">{r.description}</Typography>
                  )}
                </Stack>
              </TableCell>
              <TableCell>
                <Typography variant="body2">{r.building}</Typography>
                <Typography variant="caption" color="text.secondary">{r.floor} этаж</Typography>
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                  <Groups2Outlined fontSize="small" />
                  <span>{r.capacity}</span>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {r.equipment.map((k) => <Chip key={k} label={EQUIP_LABEL[k] ?? k} size="small" variant="outlined" />)}
                </Stack>
              </TableCell>
              <TableCell>
                <Chip
                  label={STATUS_LABEL[r.status]}
                  size="small"
                  color={STATUS_COLOR[r.status]}
                  variant={r.status === "maintenance" ? "outlined" : "filled"}
                />
              </TableCell>
              <TableCell align="center">
                <IconButton size="small" title="Просмотр"><VisibilityOutlined fontSize="small" /></IconButton>
                <IconButton size="small" title="Редактировать"><EditOutlined fontSize="small" /></IconButton>
                <IconButton size="small" color="error" title="Удалить"><DeleteOutline fontSize="small" /></IconButton>
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
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="На странице"
      />
    </Paper>
  );
}
