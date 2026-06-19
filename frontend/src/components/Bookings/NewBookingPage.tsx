import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Box, Typography, TextField, MenuItem, Checkbox, FormControlLabel,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Stepper, Step, StepLabel, type StepIconProps,
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import ArrowBackOutlined from "@mui/icons-material/ArrowBackOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import EventNoteOutlined from "@mui/icons-material/EventNoteOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import MeetingRoomOutlined from "@mui/icons-material/MeetingRoomOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import BuildOutlined from "@mui/icons-material/BuildOutlined";
import AddOutlined from "@mui/icons-material/AddOutlined";

import {
  createBooking,
  updateBooking,
  fetchBooking,
  fetchAuditoriesForSelect,
  type BookingDetailsDto,
  type BookingDto,
  type BookingStatus,
  type CreateBookingPayload,
} from "@/api/bookingsApi";
import "../RoomsCatalog/catalog.css";
import "./new-booking.css";

const STEPS = [
  "Основная информация",
  "Дата и время",
  "Аудитория",
  "Участники",
  "Оборудование",
  "Подтверждение",
];

const EVENT_TYPES = ["Лекция", "Семинар", "Практика", "Экзамен", "Конференция", "Другое"];
const FORMATS = ["Очно", "Онлайн", "Смешанный"];
const PARTICIPANT_TYPES = ["Студенты", "Преподаватели", "Смешанная группа", "Внешние гости"];
const PREP_OPTIONS = ["0", "15", "30", "45", "60"];
const EQUIPMENT_OPTIONS = [
  "Проектор", "Микрофон", "Компьютер", "Интерактивная доска",
  "Видеосвязь", "Wi-Fi", "Кондиционер", "Система звука", "Лабораторное оборудование",
];

export type NewBookingForm = {
  title: string;
  eventType: string;
  subject: string;
  format: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  prepMinutes: string;
  cleanupMinutes: string;
  recurring: boolean;
  auditoryId: string;
  backupAuditoryId: string;
  organizer: string;
  organizerPosition: string;
  organizerEmail: string;
  organizerPhone: string;
  organizerDepartment: string;
  organizerFaculty: string;
  expectedParticipants: string;
  participantType: string;
  groups: string[];
  groupInput: string;
  specialRequirements: string;
  equipment: string[];
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function defaultForm(): NewBookingForm {
  return {
    title: "",
    eventType: "",
    subject: "",
    format: "Очно",
    description: "",
    startDate: todayIso(),
    endDate: todayIso(),
    startTime: "10:00",
    endTime: "12:00",
    prepMinutes: "15",
    cleanupMinutes: "15",
    recurring: false,
    auditoryId: "",
    backupAuditoryId: "",
    organizer: "",
    organizerPosition: "",
    organizerEmail: "",
    organizerPhone: "",
    organizerDepartment: "",
    organizerFaculty: "",
    expectedParticipants: "",
    participantType: "",
    groups: [],
    groupInput: "",
    specialRequirements: "",
    equipment: [],
  };
}

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

function splitDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function formFromBooking(b: BookingDto): NewBookingForm {
  const start = splitDateTime(b.startAt);
  const end = splitDateTime(b.endAt);
  const d = b.details ?? {};
  return {
    title: b.title,
    eventType: d.eventType ?? "",
    subject: d.subject ?? "",
    format: d.format ?? "Очно",
    description: b.description ?? "",
    startDate: start.date,
    endDate: end.date,
    startTime: start.time,
    endTime: end.time,
    prepMinutes: d.prepMinutes ?? "15",
    cleanupMinutes: d.cleanupMinutes ?? "15",
    recurring: d.recurring ?? false,
    auditoryId: b.auditoryId,
    backupAuditoryId: d.backupAuditoryId ?? "",
    organizer: b.organizer,
    organizerPosition: d.organizerPosition ?? "",
    organizerEmail: b.organizerEmail,
    organizerPhone: d.organizerPhone ?? "",
    organizerDepartment: d.organizerDepartment ?? "",
    organizerFaculty: d.organizerFaculty ?? "",
    expectedParticipants: d.expectedParticipants ?? "",
    participantType: d.participantType ?? "",
    groups: d.groups ?? [],
    groupInput: "",
    specialRequirements: d.specialRequirements ?? "",
    equipment: d.equipment ?? [],
  };
}

function buildDetails(form: NewBookingForm): BookingDetailsDto {
  return {
    eventType: form.eventType,
    subject: form.subject,
    format: form.format,
    prepMinutes: form.prepMinutes,
    cleanupMinutes: form.cleanupMinutes,
    recurring: form.recurring,
    backupAuditoryId: form.backupAuditoryId || undefined,
    organizerPosition: form.organizerPosition,
    organizerPhone: form.organizerPhone,
    organizerDepartment: form.organizerDepartment,
    organizerFaculty: form.organizerFaculty,
    expectedParticipants: form.expectedParticipants,
    participantType: form.participantType,
    groups: form.groups,
    specialRequirements: form.specialRequirements,
    equipment: form.equipment,
  };
}

function buildNote(form: NewBookingForm) {
  const parts: string[] = [];
  if (form.groups.length) parts.push(`Группы: ${form.groups.join(", ")}`);
  if (form.expectedParticipants) parts.push(`${form.expectedParticipants} чел.`);
  if (form.specialRequirements) parts.push(form.specialRequirements);
  return parts.join(" · ") || undefined;
}

type Props = {
  bookingId?: string | null;
  onBack: () => void;
  onSaved: () => void;
};

export function NewBookingPage({ bookingId, onBack, onSaved }: Props) {
  const [form, setForm] = useState<NewBookingForm>(defaultForm);
  const [auditories, setAuditories] = useState<Array<{ id: string; code: string; name: string; capacity: number }>>([]);
  const [loading, setLoading] = useState(!!bookingId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    fetchAuditoriesForSelect().then(setAuditories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!bookingId) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const b = await fetchBooking(bookingId);
        if (mounted) setForm(formFromBooking(b));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [bookingId]);

  const set = <K extends keyof NewBookingForm>(key: K, value: NewBookingForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const roomLabel = (id: string) => {
    const r = auditories.find((a) => a.id === id);
    return r ? `${r.code} — ${r.name}` : "Не указана";
  };

  const stepComplete = useMemo(() => {
    const datetimeOk = Boolean(
      form.startDate && form.endDate && form.startTime && form.endTime
      && new Date(combineDateTime(form.endDate, form.endTime)) > new Date(combineDateTime(form.startDate, form.startTime)),
    );
    const participantsOk = Boolean(
      form.organizer.trim()
      || form.expectedParticipants
      || form.groups.length > 0
      || form.participantType,
    );
    const equipmentOk = form.equipment.length > 0;
    const confirmOk = Boolean(form.title.trim() && form.auditoryId && datetimeOk && participantsOk);

    return [
      Boolean(form.title.trim()),
      datetimeOk,
      Boolean(form.auditoryId),
      participantsOk,
      equipmentOk,
      confirmOk,
    ];
  }, [form]);

  const activeStep = useMemo(() => {
    const idx = stepComplete.findIndex((ok) => !ok);
    return idx === -1 ? STEPS.length - 1 : idx;
  }, [stepComplete]);

  const scrollToStep = (index: number) => {
    const keys = ["basic", "datetime", "room", "participants", "equipment", "confirm"];
    sectionRefs.current[keys[index]]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const validate = () => {
    if (!form.title.trim()) return "Укажите название мероприятия";
    if (!form.auditoryId) return "Выберите аудиторию";
    const start = combineDateTime(form.startDate, form.startTime);
    const end = combineDateTime(form.endDate, form.endTime);
    if (new Date(end) <= new Date(start)) return "Время окончания должно быть позже начала";
    return "";
  };

  const buildPayload = (status: BookingStatus): CreateBookingPayload => ({
    auditoryId: form.auditoryId,
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    organizer: form.organizer.trim(),
    organizerEmail: form.organizerEmail.trim(),
    note: buildNote(form),
    startAt: combineDateTime(form.startDate, form.startTime),
    endAt: combineDateTime(form.endDate, form.endTime),
    status,
    details: buildDetails(form),
  });

  const handleSave = async (status: BookingStatus) => {
    if (status === "draft") {
      if (!form.auditoryId) {
        setError("Для черновика выберите аудиторию");
        return;
      }
    } else {
      const err = validate();
      if (err) {
        setError(err);
        return;
      }
    }

    try {
      setSaving(true);
      setError("");
      const payload = buildPayload(status);
      if (bookingId) {
        await updateBooking(bookingId, payload);
      } else {
        await createBooking(payload);
      }
      onSaved();
    } catch {
      setError("Не удалось сохранить бронирование");
    } finally {
      setSaving(false);
    }
  };

  const addGroup = () => {
    const g = form.groupInput.trim();
    if (!g || form.groups.includes(g)) return;
    set("groups", [...form.groups, g]);
    set("groupInput", "");
  };

  const toggleEquipment = (item: string) => {
    const next = new Set(form.equipment);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    set("equipment", [...next]);
  };

  const summaryValue = (filled: boolean, value: string) =>
    filled ? value : "Не указано";

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", pb: 6, px: { xs: 2, md: 3 }, pt: 3 }}>
      <div className="new-booking-page-header">
        <div>
          <Typography variant="h5" fontWeight={700}>
            {bookingId ? "Редактирование бронирования" : "Создание нового бронирования"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Заполните информацию о мероприятии и выберите аудиторию
          </Typography>
        </div>
        <div className="new-booking-page-header-actions">
          <button type="button" className="header-btn outline" onClick={() => handleSave("draft")} disabled={saving}>
            <SaveOutlined fontSize="small" />
            Сохранить как черновик
          </button>
          <button type="button" className="header-btn outline" onClick={onBack}>
            <ArrowBackOutlined fontSize="small" />
            Назад к списку
          </button>
        </div>
      </div>

      <PaperStepper activeStep={activeStep} stepComplete={stepComplete} onStepClick={scrollToStep} />

      <div className="new-booking-layout">
        <div>
          <FormSection
            id="basic"
            ref={(el) => { sectionRefs.current.basic = el; }}
            icon={<EventNoteOutlined fontSize="small" />}
            iconClass="blue"
            title="Основная информация о мероприятии"
          >
            <div className="form-grid-2">
              <TextField label="Название мероприятия *" value={form.title} onChange={(e) => set("title", e.target.value)} fullWidth />
              <TextField select label="Тип мероприятия" value={form.eventType} onChange={(e) => set("eventType", e.target.value)} fullWidth>
                <MenuItem value="">Не выбрано</MenuItem>
                {EVENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField label="Предмет / дисциплина" value={form.subject} onChange={(e) => set("subject", e.target.value)} fullWidth />
              <TextField select label="Формат проведения" value={form.format} onChange={(e) => set("format", e.target.value)} fullWidth>
                {FORMATS.map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
              </TextField>
            </div>
            <TextField
              label="Описание мероприятия"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              fullWidth
              multiline
              minRows={3}
              sx={{ mt: 2 }}
              placeholder="Краткое описание целей и содержания мероприятия..."
            />
          </FormSection>

          <FormSection
            id="datetime"
            ref={(el) => { sectionRefs.current.datetime = el; }}
            icon={<ScheduleOutlined fontSize="small" />}
            iconClass="green"
            title="Дата и время проведения"
          >
            <div className="form-grid-2">
              <TextField label="Дата начала" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Дата окончания" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Время начала" type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Время окончания" type="time" value={form.endTime} onChange={(e) => set("endTime", e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField select label="Время на подготовку" value={form.prepMinutes} onChange={(e) => set("prepMinutes", e.target.value)} fullWidth>
                {PREP_OPTIONS.map((m) => <MenuItem key={m} value={m}>{m} минут</MenuItem>)}
              </TextField>
              <TextField select label="Время на уборку" value={form.cleanupMinutes} onChange={(e) => set("cleanupMinutes", e.target.value)} fullWidth>
                {PREP_OPTIONS.map((m) => <MenuItem key={m} value={m}>{m} минут</MenuItem>)}
              </TextField>
            </div>
            <div className="recurring-box">
              <FormControlLabel
                control={<Checkbox checked={form.recurring} onChange={(e) => set("recurring", e.target.checked)} />}
                label="Повторяющееся мероприятие"
              />
            </div>
          </FormSection>

          <FormSection
            id="room"
            ref={(el) => { sectionRefs.current.room = el; }}
            icon={<MeetingRoomOutlined fontSize="small" />}
            iconClass="purple"
            title="Выбор аудитории"
          >
            <div className="form-grid-2">
              <TextField select label="Основная аудитория *" value={form.auditoryId} onChange={(e) => set("auditoryId", e.target.value)} fullWidth>
                <MenuItem value="">Выберите аудиторию</MenuItem>
                {auditories.map((a) => (
                  <MenuItem key={a.id} value={a.id}>{a.code} — {a.name} ({a.capacity} мест)</MenuItem>
                ))}
              </TextField>
              <TextField select label="Резервная аудитория" value={form.backupAuditoryId} onChange={(e) => set("backupAuditoryId", e.target.value)} fullWidth>
                <MenuItem value="">Не выбрана</MenuItem>
                {auditories.filter((a) => a.id !== form.auditoryId).map((a) => (
                  <MenuItem key={a.id} value={a.id}>{a.code} — {a.name}</MenuItem>
                ))}
              </TextField>
            </div>
          </FormSection>

          <FormSection
            id="participants"
            ref={(el) => { sectionRefs.current.participants = el; }}
            icon={<GroupsOutlined fontSize="small" />}
            iconClass="orange"
            title="Участники мероприятия"
          >
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Организатор</Typography>
            <div className="form-grid-2">
              <TextField label="ФИО" value={form.organizer} onChange={(e) => set("organizer", e.target.value)} fullWidth />
              <TextField label="Должность" value={form.organizerPosition} onChange={(e) => set("organizerPosition", e.target.value)} fullWidth />
              <TextField label="Email" type="email" value={form.organizerEmail} onChange={(e) => set("organizerEmail", e.target.value)} fullWidth />
              <TextField label="Телефон" value={form.organizerPhone} onChange={(e) => set("organizerPhone", e.target.value)} fullWidth />
              <TextField label="Кафедра" value={form.organizerDepartment} onChange={(e) => set("organizerDepartment", e.target.value)} fullWidth />
              <TextField label="Факультет" value={form.organizerFaculty} onChange={(e) => set("organizerFaculty", e.target.value)} fullWidth />
            </div>

            <Typography variant="subtitle2" fontWeight={600} mt={3} mb={1.5}>Участники</Typography>
            <div className="form-grid-2">
              <TextField label="Ожидаемое количество" type="number" value={form.expectedParticipants} onChange={(e) => set("expectedParticipants", e.target.value)} fullWidth />
              <TextField select label="Тип участников" value={form.participantType} onChange={(e) => set("participantType", e.target.value)} fullWidth>
                <MenuItem value="">Не выбрано</MenuItem>
                {PARTICIPANT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </div>

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <TextField
                label="Группы"
                value={form.groupInput}
                onChange={(e) => set("groupInput", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGroup())}
                fullWidth
                placeholder="Например: М-101"
              />
              <button type="button" className="header-btn outline" onClick={addGroup} style={{ marginTop: 8 }}>
                <AddOutlined fontSize="small" />
              </button>
            </Box>
            {form.groups.length > 0 && (
              <div className="group-tags">
                {form.groups.map((g) => (
                  <span key={g} className="group-tag">
                    {g}
                    <button type="button" onClick={() => set("groups", form.groups.filter((x) => x !== g))}>×</button>
                  </span>
                ))}
              </div>
            )}

            <TextField
              label="Особые требования к участникам"
              value={form.specialRequirements}
              onChange={(e) => set("specialRequirements", e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mt: 2 }}
            />
          </FormSection>

          <FormSection
            id="equipment"
            ref={(el) => { sectionRefs.current.equipment = el; }}
            icon={<BuildOutlined fontSize="small" />}
            iconClass="teal"
            title="Оборудование и требования"
          >
            <div className="equipment-grid">
              {EQUIPMENT_OPTIONS.map((item) => (
                <label key={item} className="equipment-check">
                  <input
                    type="checkbox"
                    checked={form.equipment.includes(item)}
                    onChange={() => toggleEquipment(item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </FormSection>

          <div ref={(el) => { sectionRefs.current.confirm = el; }} style={{ scrollMarginTop: 24 }} />
        </div>

        <aside className="booking-summary-panel">
          <Typography fontWeight={700} mb={2}>Сводка бронирования</Typography>

          <div className={`summary-row blue`}>
            <span className="label">Мероприятие</span>
            <span className="value">{summaryValue(Boolean(form.title), form.title || "—")}</span>
          </div>
          <div className={`summary-row green`}>
            <span className="label">Аудитория</span>
            <span className="value">{summaryValue(Boolean(form.auditoryId), roomLabel(form.auditoryId))}</span>
          </div>
          <div className={`summary-row purple`}>
            <span className="label">Дата и время</span>
            <span className="value">
              {form.startDate && form.startTime
                ? `${form.startDate} ${form.startTime}–${form.endTime}`
                : "Не указано"}
            </span>
          </div>
          <div className={`summary-row orange`}>
            <span className="label">Организатор</span>
            <span className="value">{summaryValue(Boolean(form.organizer), form.organizer || "—")}</span>
          </div>
          <div className={`summary-row red`}>
            <span className="label">Участники</span>
            <span className="value">
              {form.expectedParticipants
                ? `${form.expectedParticipants} чел.`
                : form.groups.length
                  ? form.groups.join(", ")
                  : "Не указано"}
            </span>
          </div>
          <div className={`summary-row gray`}>
            <span className="label">Оборудование</span>
            <span className="value">
              {form.equipment.length ? form.equipment.join(", ") : "Не выбрано"}
            </span>
          </div>

          {error && (
            <Typography color="error" fontSize="0.8125rem" mt={1}>{error}</Typography>
          )}

          <div className="summary-actions">
            <button type="button" className="header-btn primary" onClick={() => handleSave("confirmed")} disabled={saving}>
              {bookingId ? "Сохранить изменения" : "Создать бронирование"}
            </button>
            <button type="button" className="header-btn preview" onClick={() => setPreviewOpen(true)}>
              <VisibilityOutlined fontSize="small" />
              Предварительный просмотр
            </button>
            <button type="button" className="header-btn draft" onClick={() => handleSave("draft")} disabled={saving}>
              <SaveOutlined fontSize="small" />
              Сохранить как черновик
            </button>
          </div>
          <div className="summary-cancel">
            <button type="button" onClick={onBack}>Отмена</button>
          </div>
        </aside>
      </div>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Предварительный просмотр</DialogTitle>
        <DialogContent>
          <StackPreview form={form} roomLabel={roomLabel} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Закрыть</Button>
          <Button variant="contained" onClick={() => { setPreviewOpen(false); handleSave("confirmed"); }}>
            Создать бронирование
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function BookingStepIcon({ icon, active, completed }: StepIconProps) {
  if (completed) {
    return (
      <div className="booking-step-icon completed">
        <Check sx={{ fontSize: 18, color: "#fff" }} />
      </div>
    );
  }
  return (
    <div className={`booking-step-icon ${active ? "active" : "pending"}`}>
      {icon}
    </div>
  );
}

function PaperStepper({
  activeStep,
  stepComplete,
  onStepClick,
}: {
  activeStep: number;
  stepComplete: boolean[];
  onStepClick: (i: number) => void;
}) {
  return (
    <div className="new-booking-stepper">
      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((label, i) => (
          <Step
            key={label}
            completed={stepComplete[i]}
            active={!stepComplete[i] && i === activeStep}
            onClick={() => onStepClick(i)}
            sx={{ cursor: "pointer" }}
          >
            <StepLabel
              StepIconComponent={BookingStepIcon}
              sx={{
                "& .MuiStepLabel-label": {
                  color: stepComplete[i] || i === activeStep ? "#2563eb" : "#94a3b8",
                  fontWeight: stepComplete[i] || i === activeStep ? 600 : 400,
                },
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

const FormSection = ({
  id,
  icon,
  iconClass,
  title,
  children,
  ref,
}: {
  id: string;
  icon: ReactNode;
  iconClass: string;
  title: string;
  children: ReactNode;
  ref?: (el: HTMLElement | null) => void;
}) => (
  <section id={id} className="form-section" ref={ref}>
    <div className="form-section-header">
      <div className={`form-section-icon ${iconClass}`}>{icon}</div>
      <Typography fontWeight={700}>{title}</Typography>
    </div>
    {children}
  </section>
);

function StackPreview({
  form,
  roomLabel,
}: {
  form: NewBookingForm;
  roomLabel: (id: string) => string;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
      <Row label="Мероприятие" value={form.title || "—"} />
      <Row label="Тип" value={form.eventType || "—"} />
      <Row label="Аудитория" value={form.auditoryId ? roomLabel(form.auditoryId) : "—"} />
      <Row label="Дата" value={`${form.startDate} ${form.startTime} – ${form.endTime}`} />
      <Row label="Организатор" value={form.organizer || "—"} />
      <Row label="Email" value={form.organizerEmail || "—"} />
      <Row label="Участники" value={form.expectedParticipants ? `${form.expectedParticipants} чел.` : "—"} />
      <Row label="Оборудование" value={form.equipment.join(", ") || "—"} />
    </Box>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography fontWeight={500}>{value}</Typography>
    </Box>
  );
}
