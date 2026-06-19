import { useEffect, useState } from "react";
import {
  Container, Box, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Tabs, Tab, Paper, Stack, Typography, TableContainer,
} from "@mui/material";
import { Edit, Delete, Save, Close } from "@mui/icons-material";
import { API_BASE } from "@/config";
import { fetchBuildings } from "@/api/roomsApi";
import "@/components/RoomsCatalog/catalog.css";
import "./settings.css";

type Device = { id: string; name: string };

type Auditory = {
  id: string;
  code?: string;
  name: string;
  capacity?: number;
  status?: string;
  building?: string;
  floor?: number;
  equipment?: string[];
};

const DEFAULT_BUILDINGS = ["Главный корпус", "Корпус Б"];
const FLOORS = [1, 2, 3, 4, 5];

function deviceIdsToNames(devices: Device[], ids: string[]) {
  return ids.map((id) => devices.find((d) => d.id === id)?.name ?? id);
}

function namesToDeviceIds(devices: Device[], names: string[]) {
  return names
    .map((n) => devices.find((d) => d.name === n || d.id === n)?.id)
    .filter(Boolean) as string[];
}

function EquipmentPicker({
  devices,
  selectedIds,
  onChange,
}: {
  devices: Device[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  if (devices.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Сначала добавьте устройства на вкладке «Устройства»
      </Typography>
    );
  }

  return (
    <div className="settings-equip-picker">
      {devices.map((d) => (
        <button
          key={d.id}
          type="button"
          className={`settings-equip-chip${selectedIds.includes(d.id) ? " selected" : ""}`}
          onClick={() => toggle(d.id)}
        >
          {d.name}
        </button>
      ))}
    </div>
  );
}

export function SettingsPage({
  initialTab = 0,
  onTabChange,
}: {
  initialTab?: number;
  onTabChange?: (tab: number) => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [devices, setDevices] = useState<Device[]>([]);
  const [auditories, setAuditories] = useState<Auditory[]>([]);
  const [buildings, setBuildings] = useState<string[]>(DEFAULT_BUILDINGS);

  const [newDevice, setNewDevice] = useState("");
  const [editDeviceId, setEditDeviceId] = useState<string | null>(null);
  const [editDeviceName, setEditDeviceName] = useState("");

  const [newAuditory, setNewAuditory] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newStatus, setNewStatus] = useState("available");
  const [newBuilding, setNewBuilding] = useState("Главный корпус");
  const [newFloor, setNewFloor] = useState("1");
  const [newEquipmentIds, setNewEquipmentIds] = useState<string[]>([]);

  const [editAuditoryId, setEditAuditoryId] = useState<string | null>(null);
  const [editAuditoryName, setEditAuditoryName] = useState("");
  const [editAuditoryCapacity, setEditAuditoryCapacity] = useState("");
  const [editAuditoryStatus, setEditAuditoryStatus] = useState("available");
  const [editBuilding, setEditBuilding] = useState("Главный корпус");
  const [editFloor, setEditFloor] = useState("1");
  const [editEquipmentIds, setEditEquipmentIds] = useState<string[]>([]);

  const API = API_BASE;

  const loadAll = async () => {
    const [devRes, audRes] = await Promise.all([
      fetch(`${API}/devices`),
      fetch(`${API}/auditories`),
    ]);
    setDevices(await devRes.json());
    if (audRes.ok) {
      const data = await audRes.json();
      setAuditories(Array.isArray(data) ? data : []);
    }
    try {
      const b = await fetchBuildings();
      if (b.length) setBuildings([...new Set([...DEFAULT_BUILDINGS, ...b])]);
    } catch { /* use defaults */ }
  };

  useEffect(() => { setTab(initialTab); }, [initialTab]);

  useEffect(() => { loadAll(); }, []);

  const createDevice = async () => {
    if (!newDevice.trim()) return;
    const res = await fetch(`${API}/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDevice.trim() }),
    });
    setDevices([...devices, await res.json()]);
    setNewDevice("");
  };

  const saveDevice = async (id: string) => {
    const res = await fetch(`${API}/devices/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editDeviceName }),
    });
    const updated = await res.json();
    setDevices(devices.map((d) => (d.id === id ? updated : d)));
    setEditDeviceId(null);
  };

  const deleteDevice = async (id: string) => {
    await fetch(`${API}/devices/${id}`, { method: "DELETE" });
    setDevices(devices.filter((d) => d.id !== id));
  };

  const resetAuditoryForm = () => {
    setNewAuditory("");
    setNewCode("");
    setNewCapacity("");
    setNewStatus("available");
    setNewBuilding("Главный корпус");
    setNewFloor("1");
    setNewEquipmentIds([]);
  };

  const createAuditory = async () => {
    if (!newAuditory.trim()) return;
    const equipment = deviceIdsToNames(devices, newEquipmentIds);
    const res = await fetch(`${API}/auditories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newAuditory.trim(),
        code: newCode.trim() || undefined,
        capacity: Number(newCapacity) || 0,
        status: newStatus,
        building: newBuilding,
        floor: Number(newFloor),
        equipment,
      }),
    });
    setAuditories([...auditories, await res.json()]);
    resetAuditoryForm();
  };

  const startEditAuditory = (a: Auditory) => {
    setEditAuditoryId(a.id);
    setEditAuditoryName(a.name);
    setEditAuditoryCapacity(a.capacity?.toString() || "");
    setEditAuditoryStatus(a.status || "available");
    setEditBuilding(a.building || "Главный корпус");
    setEditFloor(String(a.floor ?? 1));
    setEditEquipmentIds(namesToDeviceIds(devices, a.equipment ?? []));
  };

  const saveAuditory = async (id: string) => {
    const equipment = deviceIdsToNames(devices, editEquipmentIds);
    const res = await fetch(`${API}/auditories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editAuditoryName,
        capacity: Number(editAuditoryCapacity),
        status: editAuditoryStatus,
        building: editBuilding,
        floor: Number(editFloor),
        equipment,
      }),
    });
    const updated = await res.json();
    setAuditories(auditories.map((a) => (a.id === id ? updated : a)));
    setEditAuditoryId(null);
  };

  const deleteAuditory = async (id: string) => {
    await fetch(`${API}/auditories/${id}`, { method: "DELETE" });
    setAuditories(auditories.filter((a) => a.id !== id));
  };

  const buildingOptions = buildings;

  return (
    <Container maxWidth="lg" className="settings-page" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>Настройки</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Управление устройствами и аудиториями
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => {
          setTab(v);
          onTabChange?.(v);
        }}
        sx={{ mb: 3 }}
      >
        <Tab label="Устройства" />
        <Tab label="Аудитории" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Справочник оборудования — эти позиции можно назначать аудиториям при создании.
          </Typography>

          <Paper elevation={0} className="settings-form-panel">
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Новое устройство"
                value={newDevice}
                onChange={(e) => setNewDevice(e.target.value)}
                size="small"
                fullWidth
                placeholder="Например: проектор"
                onKeyDown={(e) => e.key === "Enter" && createDevice()}
              />
              <Button onClick={createDevice} variant="contained" disableElevation sx={{ minWidth: 120 }}>
                Добавить
              </Button>
            </Stack>
          </Paper>

          <TableContainer component={Paper} elevation={0} className="settings-table-panel">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell align="right" width={140}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      Нет устройств
                    </TableCell>
                  </TableRow>
                ) : devices.map((d) => (
                  <TableRow key={d.id} hover>
                    <TableCell>
                      {editDeviceId === d.id ? (
                        <TextField
                          size="small"
                          fullWidth
                          value={editDeviceName}
                          onChange={(e) => setEditDeviceName(e.target.value)}
                        />
                      ) : (
                        <Typography fontWeight={600}>{d.name}</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {editDeviceId === d.id ? (
                          <>
                            <IconButton color="success" onClick={() => saveDevice(d.id)}><Save fontSize="small" /></IconButton>
                            <IconButton onClick={() => setEditDeviceId(null)}><Close fontSize="small" /></IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton color="primary" onClick={() => { setEditDeviceId(d.id); setEditDeviceName(d.name); }}>
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton color="error" onClick={() => deleteDevice(d.id)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Paper elevation={0} className="settings-form-panel">
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <TextField
                  label="Номер / код"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                  placeholder="411"
                />
                <TextField
                  label="Название аудитории"
                  value={newAuditory}
                  onChange={(e) => setNewAuditory(e.target.value)}
                  size="small"
                  sx={{ flex: "1 1 200px" }}
                  placeholder="Лекционная"
                />
                <TextField
                  label="Мест"
                  type="number"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  size="small"
                  sx={{ width: 100 }}
                />
              </Stack>

              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <TextField
                  select
                  label="Корпус"
                  value={newBuilding}
                  onChange={(e) => setNewBuilding(e.target.value)}
                  size="small"
                  sx={{ minWidth: 180 }}
                  SelectProps={{ native: true }}
                >
                  {buildingOptions.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Этаж"
                  value={newFloor}
                  onChange={(e) => setNewFloor(e.target.value)}
                  size="small"
                  sx={{ width: 120 }}
                  SelectProps={{ native: true }}
                >
                  {FLOORS.map((f) => (
                    <option key={f} value={String(f)}>{f} этаж</option>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Статус"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  size="small"
                  sx={{ width: 160 }}
                  SelectProps={{ native: true }}
                >
                  <option value="available">Доступна</option>
                  <option value="booked">Забронирована</option>
                  <option value="maintenance">На обслуживании</option>
                </TextField>
              </Stack>

              <Box>
                <span className="settings-equip-label">Оборудование в аудитории</span>
                <EquipmentPicker
                  devices={devices}
                  selectedIds={newEquipmentIds}
                  onChange={setNewEquipmentIds}
                />
              </Box>

              <Box>
                <Button onClick={createAuditory} variant="contained" disableElevation>
                  Добавить
                </Button>
              </Box>
            </Stack>
          </Paper>

          <TableContainer component={Paper} elevation={0} className="settings-table-panel">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Корпус</TableCell>
                  <TableCell>Этаж</TableCell>
                  <TableCell>Мест</TableCell>
                  <TableCell>Оборудование</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right" width={140}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditories.map((a) => {
                  const isEdit = editAuditoryId === a.id;
                  return (
                    <TableRow key={a.id} hover>
                      <TableCell>
                        {isEdit ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={editAuditoryName}
                            onChange={(e) => setEditAuditoryName(e.target.value)}
                          />
                        ) : (
                          <Box>
                            <Typography fontWeight={600}>{a.name}</Typography>
                            {a.code && (
                              <Typography variant="caption" color="text.secondary">{a.code}</Typography>
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEdit ? (
                          <TextField
                            select
                            size="small"
                            value={editBuilding}
                            onChange={(e) => setEditBuilding(e.target.value)}
                            SelectProps={{ native: true }}
                            sx={{ minWidth: 140 }}
                          >
                            {buildingOptions.map((b) => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </TextField>
                        ) : (
                          <Typography variant="body2">{a.building || "—"}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEdit ? (
                          <TextField
                            select
                            size="small"
                            value={editFloor}
                            onChange={(e) => setEditFloor(e.target.value)}
                            SelectProps={{ native: true }}
                            sx={{ width: 100 }}
                          >
                            {FLOORS.map((f) => (
                              <option key={f} value={String(f)}>{f}</option>
                            ))}
                          </TextField>
                        ) : (
                          <Typography variant="body2">{a.floor ?? "—"}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEdit ? (
                          <TextField
                            type="number"
                            size="small"
                            value={editAuditoryCapacity}
                            onChange={(e) => setEditAuditoryCapacity(e.target.value)}
                            sx={{ width: 80 }}
                          />
                        ) : (
                          <Typography>{a.capacity ?? 0}</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        {isEdit ? (
                          <EquipmentPicker
                            devices={devices}
                            selectedIds={editEquipmentIds}
                            onChange={setEditEquipmentIds}
                          />
                        ) : (
                          <Box>
                            {(a.equipment ?? []).length === 0 ? (
                              <Typography variant="body2" color="text.secondary">—</Typography>
                            ) : (
                              (a.equipment ?? []).map((eq) => (
                                <span key={eq} className="settings-mini-pill">{eq}</span>
                              ))
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEdit ? (
                          <TextField
                            select
                            size="small"
                            value={editAuditoryStatus}
                            onChange={(e) => setEditAuditoryStatus(e.target.value)}
                            SelectProps={{ native: true }}
                          >
                            <option value="available">Доступна</option>
                            <option value="booked">Забронирована</option>
                            <option value="maintenance">На обслуживании</option>
                          </TextField>
                        ) : (
                          <span className={`status-badge ${a.status || "available"}`}>
                            {a.status === "booked" ? "Забронирована" : a.status === "maintenance" ? "На обслуживании" : "Доступна"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          {isEdit ? (
                            <>
                              <IconButton onClick={() => saveAuditory(a.id)} color="success"><Save fontSize="small" /></IconButton>
                              <IconButton onClick={() => setEditAuditoryId(null)}><Close fontSize="small" /></IconButton>
                            </>
                          ) : (
                            <>
                              <IconButton onClick={() => startEditAuditory(a)} color="primary">
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton onClick={() => deleteAuditory(a.id)} color="error">
                                <Delete fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}
