import { useEffect, useState } from "react"
import { Container, Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tabs, Tab, Paper, Stack, Typography, TableContainer } from "@mui/material"
import { Edit, Delete, Save, Close } from "@mui/icons-material"

import { Header } from './components/Header';


type Device = { id: string; name: string; status: 'active' | 'maintenance' | 'broken'; type: string; }
type Auditory = { id: string; name: string; capacity?: number; status?: string }
type Booking = { id: string; deviceId: string; auditoryId: string; device?: Device; auditory?: Auditory }

export default function App() {
  const [tab, setTab] = useState<0|1|2>(0)

  const [devices, setDevices] = useState<Device[]>([])
  const [auditories, setAuditories] = useState<Auditory[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const [newCapacity, setNewCapacity] = useState("")
  const [newStatus, setNewStatus] = useState("available")

  const [newDevice, setNewDevice] = useState("")
  const [editDeviceId, setEditDeviceId] = useState<string|null>(null)
  const [editDeviceName, setEditDeviceName] = useState("")

  const [newAuditory, setNewAuditory] = useState("")
  const [editAuditoryId, setEditAuditoryId] = useState<string|null>(null)
  const [editAuditoryName, setEditAuditoryName] = useState("")
  const [editAuditoryCapacity, setEditAuditoryCapacity] = useState("")
  const [editAuditoryStatus, setEditAuditoryStatus] = useState("available")

  const [newBookingDevice, setNewBookingDevice] = useState("")
  const [newBookingAuditory, setNewBookingAuditory] = useState("")
  const [editBookingId, setEditBookingId] = useState<string|null>(null)
  const [editBookingDeviceId, setEditBookingDeviceId] = useState("")
  const [editBookingAuditoryId, setEditBookingAuditoryId] = useState("")


  let  API: string = "http://localhost:3000/api"
    if ((import.meta as any).env?.PROD || (globalThis as any).process?.env?.NODE_ENV === "production") {
      API = "https://rooms-9z2w.onrender.com/api"
    }

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const devRes = await fetch(`${API}/devices`)
    setDevices(await devRes.json())
     const audRes = await fetch(`${API}/auditories`)
    if (audRes.ok) {
      const data = await audRes.json()
      setAuditories(Array.isArray(data) ? data : []) 
    } else {
      console.error("Ошибка сервера:", audRes.status)
      setAuditories([]) 
    }
    const bookRes = await fetch(`${API}/bookings`)
    setBookings(await bookRes.json())
  }

  // --- Device CRUD ---
  const createDevice = async () => {
    if(!newDevice.trim()) return
    const res = await fetch(`${API}/devices`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:newDevice})
    })
    const created = await res.json()
    setDevices([...devices, created])
    setNewDevice("")
  }

  const saveDevice = async (id:string) => {
    const res = await fetch(`${API}/devices/${id}`, {
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:editDeviceName})
    })
    const updated = await res.json()
    setDevices(devices.map(d => d.id === id ? updated : d))
    setEditDeviceId(null)
  }

  const deleteDevice = async (id:string) => {
    await fetch(`${API}/devices/${id}`, { method:"DELETE" })
    setDevices(devices.filter(d=>d.id!==id))
  }

  // --- Auditory CRUD ---
  const createAuditory = async () => {
    if(!newAuditory.trim()) return
    const res = await fetch(`${API}/auditories`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        name:newAuditory, 
        capacity: Number(newCapacity), 
        status: newStatus
      })
    })
    const created = await res.json()
    setAuditories([...auditories, created])
    setNewAuditory("")
    setNewCapacity("")
  }

  const saveAuditory = async (id:string) => {
    const res = await fetch(`${API}/auditories/${id}`, {
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        name:editAuditoryName,
        capacity: Number(editAuditoryCapacity), 
        status: editAuditoryStatus 
      })
    })
    const updated = await res.json()
    setAuditories(auditories.map(a => a.id === id ? updated : a))
    setEditAuditoryId(null)
  }

  const deleteAuditory = async (id:string) => {
    await fetch(`${API}/auditories/${id}`, { method:"DELETE" })
    setAuditories(auditories.filter(a=>a.id!==id))
  }

  // --- Booking CRUD ---
  const createBooking = async () => {
    if(!newBookingDevice || !newBookingAuditory) return
    const res = await fetch(`${API}/bookings`, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({deviceId:newBookingDevice, auditoryId:newBookingAuditory})
    })
    const created = await res.json()
    setBookings([...bookings, created])
    setNewBookingDevice("")
    setNewBookingAuditory("")
  }

const saveBooking = async (id: string) => {
 try {
    const res = await fetch(`${API}/bookings/${id}`, {
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: editBookingDeviceId, 
        auditoryId: editBookingAuditoryId 
      })
    })

    if (res.ok) {
      setEditBookingId(null); 
      loadAll(); 
    } else {
      const errorData = await res.json();
      console.error("Ошибка при сохранении:", errorData);
      alert("Не удалось сохранить: " + (errorData.error || "неизвестная ошибка"));
    }
  } catch (error) {
    console.error("Сетевая ошибка:", error);
  }
}

  const deleteBooking = async (id:string) => {
    await fetch(`${API}/bookings/${id}`, { method:"DELETE" })
    setBookings(bookings.filter(b=>b.id!==id))
  }

  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
     <Header 
        activeNavId={tab.toString()} 
        onNavigate={(id) => setTab(Number(id) as any)} 
      />
    <Container maxWidth="md" sx={{ mt: 6, mb: 6, mx: "auto" }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider',justifyContent: 'center', mb: 4 }}></Box>
      
      <Tabs value={tab} onChange={(_,v)=>setTab(v)}>
        <Tab label="Devices"/>
        <Tab label="Auditories"/>
        <Tab label="Bookings"/>
      </Tabs>

      <Box sx={{ mt:3 }}>
        {/* Devices */}
        {tab===0 && (
          <Box>
              {/* 1. СТАТИСТИКА УСТРОЙСТВ  */}
              <Stack direction="row" spacing={3} mb={4}>
                <Paper sx={{ p: 2, flex: 1, borderRadius: 3, border: "1px solid #e2e8f0" }}>
                  <Typography variant="caption" color="text.secondary">Всего устройств</Typography>
                  <Typography variant="h6" fontWeight={700}>{devices.length}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, borderRadius: 3, border: "1px solid #e2e8f0", borderLeft: "4px solid #10b981" }}>
                  <Typography variant="caption" color="text.secondary">Исправны</Typography>
                  <Typography variant="h6" fontWeight={700} color="#10b981">
                    {devices.filter(d => d.status !== 'broken').length}
                  </Typography>
                </Paper>
              </Stack>

              <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)"  }}>
                <Stack direction="row" spacing={2}>
                  <TextField 
                    label="Новое устройство" 
                    value={newDevice} 
                    onChange={e=>setNewDevice(e.target.value)} 
                    size="small" 
                    fullWidth 
                  />
                  <Button onClick={createDevice} variant="contained" disableElevation>Add</Button>
                </Stack>
              </Paper>

              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Устройство</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {devices.map(d => (
                      <TableRow key={d.id} hover>
                        <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem" }}>{d.id.slice(0,8)}...</TableCell>
                        <TableCell>
                          {editDeviceId === d.id ? (
                            <TextField 
                              size="small" 
                              fullWidth 
                              value={editDeviceName} 
                              onChange={(e) => setEditDeviceName(e.target.value)} 
                            />
                          ) : (
                            <>
                              <Typography fontWeight={600}>{d.name}</Typography>
                              <Typography variant="caption" color="text.secondary">Оборудование IT</Typography>
                            </>
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 5, fontSize: '0.75rem', fontWeight: 700, bgcolor: '#ecfdf5', color: '#10b981' }}>
                            В работе
                          </Box>
                        </TableCell>

                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {editDeviceId === d.id ? (
                              <>
                                <IconButton color="success" onClick={() => saveDevice(d.id)}><Save fontSize="small"/></IconButton>
                                <IconButton onClick={() => setEditDeviceId(null)}><Close fontSize="small"/></IconButton>
                              </>
                            ) : (
                              <>
                                <IconButton color="primary" onClick={() => { setEditDeviceId(d.id); setEditDeviceName(d.name); }}>
                                  <Edit fontSize="small"/>
                                </IconButton>
                                <IconButton color="error" onClick={() => deleteDevice(d.id)}>
                                  <Delete fontSize="small"/>
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

        {/* Auditories */}
        {tab===1 && (
          <Box>
             {/* 1. СТАТИСТИКА АУДИТОРИЙ  */}
              <Stack direction="row" spacing={3} mb={4}>
                <Paper elevation={0} sx={{ p: 2, flex: 1, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "white" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Всего аудиторий</Typography>
                  <Typography variant="h6" fontWeight={800}>{auditories.length}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ p: 2, flex: 1, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "white" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Доступно сейчас</Typography>
                  <Typography variant="h6" fontWeight={800} color="#10b981">
                    {auditories.filter(a => a.status === 'available').length}
                  </Typography>
                </Paper>
              </Stack>

              <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
                Управление помещениями
              </Typography>

              {/* 2. ФОРМА ДОБАВЛЕНИЯ АУДИТОРИИ */}
              <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 4, border: "1px solid #e2e8f0", bgcolor: "white" }}>
                <Stack direction="row" spacing={2}>
                  <TextField 
                    label="Название аудитории" 
                    value={newAuditory} 
                    onChange={function(e) { setNewAuditory(e.target.value) }} 
                    size="small" 
                    fullWidth 
                    placeholder="Например: 401 (Лекционная)"
                    InputProps={{ sx: { borderRadius: 3 } }}
                  />
                  <TextField 
                    label="Мест" 
                    type="number"
                    value={newCapacity} 
                    onChange={function(e) { setNewCapacity(e.target.value) }} 
                    size="small" 
                    sx={{ width: 120 }} 
                  />
                  <TextField
                    select
                    label="Статус"
                    value={newStatus}
                    onChange={function(e) { setNewStatus(e.target.value) }}
                    size="small"
                    SelectProps={{ native: true }}
                    sx={{ width: 180 }}
                  >
                    <option value="available">Доступна</option>
                    <option value="maintenance">Тех. работы</option>
                  </TextField>
                  <Button 
                    onClick={createAuditory} 
                    variant="contained" 
                    disableElevation 
                    sx={{ px: 4, borderRadius: 3, fontWeight: 700 }}
                  >
                    Add
                  </Button>
                </Stack>
              </Paper>

              {/* 3. ТАБЛИЦА АУДИТОРИЙ */}
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "#f8fafc" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Название</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Мест</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Статус</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(Array.isArray(auditories) ? auditories : []).map(function(a) {
                      return (
                        <TableRow key={a.id} hover>
                          
                          <TableCell>
                            {editAuditoryId === a.id ? (
                              <TextField 
                                fullWidth size="small" 
                                value={editAuditoryName} 
                                onChange={function(e) { setEditAuditoryName(e.target.value) }} 
                              />
                            ) : (
                              <Typography fontWeight={600}>{a.name}</Typography>
                            )}
                          </TableCell>

                          
                          <TableCell>
                            {editAuditoryId === a.id ? (
                              <TextField 
                                type="number" size="small" 
                                value={editAuditoryCapacity} 
                                onChange={function(e) { setEditAuditoryCapacity(e.target.value) }} 
                                sx={{ width: 80 }}
                              />
                            ) : (
                              <Typography>{a.capacity || 0} чел.</Typography>
                            )}
                          </TableCell>

                         
                          <TableCell>
                            {editAuditoryId === a.id ? (
                              <TextField
                                select size="small"
                                value={editAuditoryStatus}
                                onChange={function(e) { setEditAuditoryStatus(e.target.value) }}
                                SelectProps={{ native: true }}
                              >
                                <option value="available">Доступна</option>
                                <option value="maintenance">Тех. работы</option>
                              </TextField>
                            ) : (
                              <Box sx={{ 
                                display: 'inline-block', px: 1.5, py: 0.5, borderRadius: 5, fontSize: '0.75rem', fontWeight: 700,
                                bgcolor: a.status === 'available' ? '#ecfdf5' : '#fff7ed',
                                color: a.status === 'available' ? '#10b981' : '#f97316'
                              }}>
                                {a.status === 'available' ? 'Доступна' : 'Тех. работы'}
                              </Box>
                            )}
                          </TableCell>

                         
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {editAuditoryId === a.id ? (
                                <>
                                  <IconButton onClick={function() { saveAuditory(a.id) }} color="success">
                                    <Save fontSize="small"/>
                                  </IconButton>
                                  <IconButton onClick={function() { setEditAuditoryId(null) }}>
                                    <Close fontSize="small"/>
                                  </IconButton>
                                </>
                              ) : (
                                <>
                                  <IconButton 
                                    onClick={function() { 
                                      setEditAuditoryId(a.id); 
                                      setEditAuditoryName(a.name);
                                      setEditAuditoryCapacity(a.capacity ? a.capacity.toString() : "");
                                      setEditAuditoryStatus(a.status || "available");
                                    }} 
                                    color="primary"
                                  >
                                    <Edit fontSize="small"/>
                                  </IconButton>
                                  <IconButton onClick={function() { deleteAuditory(a.id) }} color="error">
                                    <Delete fontSize="small"/>
                                  </IconButton>
                                </>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
          </Box>
        )}

        {/* Bookings */}
        {tab===2 && (
          <Box>
            <Stack direction="row" spacing={3} mb={4}>
              <Paper elevation={0} sx={{ p: 2, flex: 1, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "white" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Всего бронирований</Typography>
                <Typography variant="h6" fontWeight={800}>{bookings.length}</Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 2, flex: 1, borderRadius: 3, border: "1px solid #e2e8f0", bgcolor: "white", borderLeft: "4px solid #3b82f6" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>Активные связи</Typography>
                <Typography variant="h6" fontWeight={800} color="#3b82f6">
                  {bookings.length > 0 ? "В работе" : "Нет данных"}
                </Typography>
              </Paper>
            </Stack>

            <Typography variant="h5" fontWeight={700} mb={3} textAlign="center">
              Бронирование оборудования
            </Typography>

            {/* 2. ФОРМА СОЗДАНИЯ БРОНИРОВАНИЯ */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 4, borderRadius: 4, border: "1px solid #e2e8f0", bgcolor: "white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  select
                  label="Выберите устройство"
                  fullWidth
                  size="small"
                  value={newBookingDevice}
                  onChange={(e) => setNewBookingDevice(e.target.value)}
                  SelectProps={{ native: true }}
                  InputProps={{ sx: { borderRadius: 3 } }}
                >
                  <option value=""></option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </TextField>

                <Box sx={{ color: "text.secondary", fontWeight: 700 }}>→</Box>

                <TextField
                  select
                  label="Выберите аудиторию"
                  fullWidth
                  size="small"
                  value={newBookingAuditory}
                  onChange={(e) => setNewBookingAuditory(e.target.value)}
                  SelectProps={{ native: true }}
                  InputProps={{ sx: { borderRadius: 3 } }}
                >
                  <option value=""></option>
                  {auditories.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </TextField>

                <Button 
                  onClick={createBooking} 
                  variant="contained" 
                  disableElevation
                  sx={{ px: 4, py: 1, borderRadius: 3, fontWeight: 700, whiteSpace: 'nowrap' }}
                  disabled={!newBookingDevice || !newBookingAuditory}
                >
                  Закрепить
                </Button>
              </Stack>
            </Paper>

            {/* 3. ТАБЛИЦА БРОНИРОВАНИЙ */}
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: "1px solid #e2e8f0" }}>
              <Table>
                <TableHead sx={{ bgcolor: "#f8fafc" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Устройство</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Помещение</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Действие</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                   {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Нет активных бронирований
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((b) => {
                      // Проверяем, редактируется ли сейчас эта строка
                      const isEditing = editBookingId === b.id;
                      const deviceName = devices.find(d => d.id === b.deviceId)?.name || "Неизвестно";
                      const auditoryName = auditories.find(a => a.id === b.auditoryId)?.name || "Неизвестно";
                      
                      return (
                        <TableRow key={b.id} hover>
                          {/* 1. ID */}
                          <TableCell sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                            {b.id.slice(0, 8)}...
                          </TableCell>

                          {/* 2. УСТРОЙСТВО */}
                          <TableCell>
                            {isEditing ? (
                              <TextField
                                select
                                fullWidth
                                size="small"
                                SelectProps={{ native: true }}
                                value={editBookingDeviceId}
                                onChange={(e) => setEditBookingDeviceId(e.target.value)}
                              >
                                {devices.map((d) => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </TextField>
                            ) : (
                              <Typography fontWeight={600} color="primary.main">{deviceName}</Typography>
                            )}
                          </TableCell>

                          {/* 3. ПОМЕЩЕНИЕ */}
                          <TableCell>
                            {isEditing ? (
                              <TextField
                                select
                                fullWidth
                                size="small"
                                SelectProps={{ native: true }}
                                value={editBookingAuditoryId}
                                onChange={(e) => setEditBookingAuditoryId(e.target.value)}
                              >
                                {auditories.map((a) => (
                                  <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                              </TextField>
                            ) : (
                              <Typography fontWeight={500}>{auditoryName}</Typography>
                            )}
                          </TableCell>

                          {/* 4. ДЕЙСТВИЯ */}
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {isEditing ? (
                                <>
                                  {/* Кнопки СОХРАНИТЬ и ОТМЕНА */}
                                  <IconButton color="success" onClick={() => saveBooking(b.id)}>
                                    <Save fontSize="small" />
                                  </IconButton>
                                  <IconButton color="default" onClick={() => setEditBookingId(null)}>
                                    <Close fontSize="small" />
                                  </IconButton>
                                </>
                              ) : (
                                <>
                                  {/* Кнопки ИЗМЕНИТЬ и УДАЛИТЬ */}
                                  <IconButton 
                                    color="primary" 
                                    size="small"
                                    onClick={() => {
                                      setEditBookingId(b.id);
                                      setEditBookingDeviceId(b.deviceId);
                                      setEditBookingAuditoryId(b.auditoryId);
                                    }}
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    onClick={() => deleteBooking(b.id)} 
                                    color="error" 
                                    size="small"
                                    sx={{ bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

      </Box>
    </Container>
    </Box>
  )
}
