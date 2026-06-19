import { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, MenuItem, Button,
} from "@mui/material";
import {
  createBooking,
  updateBooking,
  fetchAuditoriesForSelect,
  type BookingDto,
  type BookingStatus,
  type CreateBookingPayload,
} from "@/api/bookingsApi";

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStart() {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return toLocalInput(d.toISOString());
}

function defaultEnd(startLocal: string) {
  const d = new Date(startLocal);
  d.setHours(d.getHours() + 2);
  return toLocalInput(d.toISOString());
}

type FormState = {
  auditoryId: string;
  title: string;
  organizer: string;
  organizerEmail: string;
  note: string;
  startAt: string;
  endAt: string;
  status: BookingStatus;
};

const EMPTY_FORM = (): FormState => ({
  auditoryId: "",
  title: "",
  organizer: "",
  organizerEmail: "",
  note: "",
  startAt: defaultStart(),
  endAt: defaultEnd(defaultStart()),
  status: "confirmed",
});

type Props = {
  open: boolean;
  booking?: BookingDto | null;
  onClose: () => void;
  onSaved: () => void;
};

export function BookingDialog({ open, booking, onClose, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [auditories, setAuditories] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    fetchAuditoriesForSelect().then(setAuditories).catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (booking) {
      setForm({
        auditoryId: booking.auditoryId,
        title: booking.title,
        organizer: booking.organizer,
        organizerEmail: booking.organizerEmail,
        note: booking.note ?? "",
        startAt: toLocalInput(booking.startAt),
        endAt: toLocalInput(booking.endAt),
        status: booking.status,
      });
    } else {
      const start = defaultStart();
      setForm({ ...EMPTY_FORM(), startAt: start, endAt: defaultEnd(start) });
    }
    setError("");
  }, [open, booking]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "startAt" && !booking) {
        next.endAt = defaultEnd(value as string);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!form.auditoryId) {
      setError("Выберите аудиторию");
      return;
    }
    if (!form.title.trim()) {
      setError("Укажите название мероприятия");
      return;
    }
    if (new Date(form.endAt) <= new Date(form.startAt)) {
      setError("Время окончания должно быть позже начала");
      return;
    }

    const payload: CreateBookingPayload = {
      auditoryId: form.auditoryId,
      title: form.title.trim(),
      organizer: form.organizer.trim(),
      organizerEmail: form.organizerEmail.trim(),
      note: form.note.trim() || undefined,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      status: form.status,
    };

    try {
      setSaving(true);
      setError("");
      if (booking) {
        await updateBooking(booking.id, payload);
      } else {
        await createBooking(payload);
      }
      onSaved();
      onClose();
    } catch {
      setError("Не удалось сохранить бронирование");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{booking ? "Редактировать бронирование" : "Новое бронирование"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Аудитория"
            value={form.auditoryId}
            onChange={(e) => set("auditoryId", e.target.value)}
            fullWidth
            required
          >
            {auditories.map((a) => (
              <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Название мероприятия"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            fullWidth
            required
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Организатор"
              value={form.organizer}
              onChange={(e) => set("organizer", e.target.value)}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={form.organizerEmail}
              onChange={(e) => set("organizerEmail", e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label="Примечание"
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            fullWidth
            multiline
            minRows={2}
            placeholder="Группа, количество участников и т.д."
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Начало"
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => set("startAt", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Окончание"
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => set("endAt", e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          <TextField
            select
            label="Статус"
            value={form.status}
            onChange={(e) => set("status", e.target.value as BookingStatus)}
            fullWidth
          >
            <MenuItem value="confirmed">Подтверждено</MenuItem>
            <MenuItem value="pending">Ожидает подтверждения</MenuItem>
            <MenuItem value="cancelled">Отменено</MenuItem>
          </TextField>

          {error && (
            <span style={{ color: "#dc2626", fontSize: "0.875rem" }}>{error}</span>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving}>
          {booking ? "Сохранить" : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
