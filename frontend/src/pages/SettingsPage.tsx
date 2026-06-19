import { useEffect, useState } from "react";
import {
  Container, Box, Button, TextField, Table, TableHead, TableRow, TableCell,
  TableBody, IconButton, Tabs, Tab, Paper, Stack, Typography, TableContainer,
} from "@mui/material";
import { Edit, Delete, Save, Close } from "@mui/icons-material";
import { API_BASE } from "@/config";
import "@/components/RoomsCatalog/catalog.css";

type Device = { id: string; name: string };
type Auditory = { id: string; name: string; capacity?: number; status?: string };

export function SettingsPage() {
  const [tab, setTab] = useState(0);
  const [devices, setDevices] = useState<Device[]>([]);
  const [auditories, setAuditories] = useState<Auditory[]>([]);

  const [newDevice, setNewDevice] = useState("");
  const [editDeviceId, setEditDeviceId] = useState<string | null>(null);
  const [editDeviceName, setEditDeviceName] = useState("");

  const [newAuditory, setNewAuditory] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newStatus, setNewStatus] = useState("available");
  const [editAuditoryId, setEditAuditoryId] = useState<string | null>(null);
  const [editAuditoryName, setEditAuditoryName] = useState("");
  const [editAuditoryCapacity, setEditAuditoryCapacity] = useState("");
  const [editAuditoryStatus, setEditAuditoryStatus] = useState("available");

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
  };

  useEffect(() => { loadAll(); }, []);

  const createDevice = async () => {
    if (!newDevice.trim()) return;
    const res = await fetch(`${API}/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDevice }),
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

  const createAuditory = async () => {
    if (!newAuditory.trim()) return;
    const res = await fetch(`${API}/auditories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newAuditory,
        capacity: Number(newCapacity),
        status: newStatus,
      }),
    });
    setAuditories([...auditories, await res.json()]);
    setNewAuditory("");
    setNewCapacity("");
  };

  const saveAuditory = async (id: string) => {
    const res = await fetch(`${API}/auditories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editAuditoryName,
        capacity: Number(editAuditoryCapacity),
        status: editAuditoryStatus,
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h5" fontWeight={700} mb={1}>Настройки</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Управление устройствами и аудиториями
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Устройства" />
        <Tab label="Аудитории" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Новое устройство"
                value={newDevice}
                onChange={(e) => setNewDevice(e.target.value)}
                size="small"
                fullWidth
              />
              <Button onClick={createDevice} variant="contained" disableElevation>
                Добавить
              </Button>
            </Stack>
          </Paper>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Название</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {devices.map((d) => (
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
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
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
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <TextField
                label="Название аудитории"
                value={newAuditory}
                onChange={(e) => setNewAuditory(e.target.value)}
                size="small"
                sx={{ flex: "1 1 200px" }}
                placeholder="Например: 401 (Лекционная)"
              />
              <TextField
                label="Мест"
                type="number"
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                size="small"
                sx={{ width: 100 }}
              />
              <TextField
                select
                label="Статус"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                size="small"
                SelectProps={{ native: true }}
                sx={{ width: 160 }}
              >
                <option value="available">Доступна</option>
                <option value="booked">Забронирована</option>
                <option value="maintenance">На обслуживании</option>
              </TextField>
              <Button onClick={createAuditory} variant="contained" disableElevation>
                Добавить
              </Button>
            </Stack>
          </Paper>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #e2e8f0" }}>
            <Table>
              <TableHead sx={{ bgcolor: "#f8fafc" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Название</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Мест</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {auditories.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      {editAuditoryId === a.id ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={editAuditoryName}
                          onChange={(e) => setEditAuditoryName(e.target.value)}
                        />
                      ) : (
                        <Typography fontWeight={600}>{a.name}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editAuditoryId === a.id ? (
                        <TextField
                          type="number"
                          size="small"
                          value={editAuditoryCapacity}
                          onChange={(e) => setEditAuditoryCapacity(e.target.value)}
                          sx={{ width: 80 }}
                        />
                      ) : (
                        <Typography>{a.capacity || 0}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {editAuditoryId === a.id ? (
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
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {editAuditoryId === a.id ? (
                          <>
                            <IconButton onClick={() => saveAuditory(a.id)} color="success"><Save fontSize="small" /></IconButton>
                            <IconButton onClick={() => setEditAuditoryId(null)}><Close fontSize="small" /></IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton
                              onClick={() => {
                                setEditAuditoryId(a.id);
                                setEditAuditoryName(a.name);
                                setEditAuditoryCapacity(a.capacity?.toString() || "");
                                setEditAuditoryStatus(a.status || "available");
                              }}
                              color="primary"
                            >
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
}
