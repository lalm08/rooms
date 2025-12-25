import { useEffect, useState } from "react"
import { Container, Box, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tabs, Tab } from "@mui/material"
import { Edit, Delete, Save, Close } from "@mui/icons-material"

type Device = { id: string; name: string }
type Auditory = { id: string; name: string }
type Booking = { id: string; deviceId: string; auditoryId: string; device?: Device; auditory?: Auditory }

export default function App() {
  const [tab, setTab] = useState<0|1|2>(0)

  const [devices, setDevices] = useState<Device[]>([])
  const [auditories, setAuditories] = useState<Auditory[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])

  const [newDevice, setNewDevice] = useState("")
  const [editDeviceId, setEditDeviceId] = useState<string|null>(null)
  const [editDeviceName, setEditDeviceName] = useState("")

  const [newAuditory, setNewAuditory] = useState("")
  const [editAuditoryId, setEditAuditoryId] = useState<string|null>(null)
  const [editAuditoryName, setEditAuditoryName] = useState("")

  const [newBookingDevice, setNewBookingDevice] = useState("")
  const [newBookingAuditory, setNewBookingAuditory] = useState("")

  let  API: string = "http://localhost/api"
  if(import.meta.env.PROD)
  {
    API = "https://rooms-9z2w.onrender.com"
  }

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const devRes = await fetch(`${API}/devices`)
    setDevices(await devRes.json())
    const audRes = await fetch(`${API}/auditories`)
    setAuditories(await audRes.json())
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
      body:JSON.stringify({name:newAuditory})
    })
    const created = await res.json()
    setAuditories([...auditories, created])
    setNewAuditory("")
  }

  const saveAuditory = async (id:string) => {
    const res = await fetch(`${API}/auditories/${id}`, {
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:editAuditoryName})
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

  const deleteBooking = async (id:string) => {
    await fetch(`${API}/bookings/${id}`, { method:"DELETE" })
    setBookings(bookings.filter(b=>b.id!==id))
  }

  return (
    <Container>
      <Tabs value={tab} onChange={(_,v)=>setTab(v)}>
        <Tab label="Devices"/>
        <Tab label="Auditories"/>
        <Tab label="Bookings"/>
      </Tabs>

      <Box sx={{ mt:3 }}>
        {/* Devices */}
        {tab===0 && (
          <Box>
            <Box sx={{ display:"flex", gap:2, mb:2 }}>
              <TextField label="New Device" value={newDevice} onChange={e=>setNewDevice(e.target.value)} />
              <Button onClick={createDevice} variant="contained">Add</Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {devices.map(d=>(
                  <TableRow key={d.id}>
                    <TableCell>{d.id}</TableCell>
                    <TableCell>
                      {editDeviceId===d.id
                        ? <TextField value={editDeviceName} onChange={e=>setEditDeviceName(e.target.value)} />
                        : d.name}
                    </TableCell>
                    <TableCell>
                      {editDeviceId===d.id
                        ? <>
                            <IconButton onClick={()=>saveDevice(d.id)}><Save/></IconButton>
                            <IconButton onClick={()=>setEditDeviceId(null)}><Close/></IconButton>
                          </>
                        : <>
                            <IconButton onClick={()=>{setEditDeviceId(d.id); setEditDeviceName(d.name)}}><Edit/></IconButton>
                            <IconButton onClick={()=>deleteDevice(d.id)}><Delete/></IconButton>
                          </>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Auditories */}
        {tab===1 && (
          <Box>
            <Box sx={{ display:"flex", gap:2, mb:2 }}>
              <TextField label="New Auditory" value={newAuditory} onChange={e=>setNewAuditory(e.target.value)} />
              <Button onClick={createAuditory} variant="contained">Add</Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow><TableCell>ID</TableCell><TableCell>Name</TableCell><TableCell>Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {auditories.map(a=>(
                  <TableRow key={a.id}>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>
                      {editAuditoryId===a.id
                        ? <TextField value={editAuditoryName} onChange={e=>setEditAuditoryName(e.target.value)} />
                        : a.name}
                    </TableCell>
                    <TableCell>
                      {editAuditoryId===a.id
                        ? <>
                            <IconButton onClick={()=>saveAuditory(a.id)}><Save/></IconButton>
                            <IconButton onClick={()=>setEditAuditoryId(null)}><Close/></IconButton>
                          </>
                        : <>
                            <IconButton onClick={()=>{setEditAuditoryId(a.id); setEditAuditoryName(a.name)}}><Edit/></IconButton>
                            <IconButton onClick={()=>deleteAuditory(a.id)}><Delete/></IconButton>
                          </>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Bookings */}
        {tab===2 && (
          <Box>
            <Box sx={{ display:"flex", gap:2, mb:2 }}>
              <TextField select label="Device" SelectProps={{ native:true }} value={newBookingDevice} onChange={e=>setNewBookingDevice(e.target.value)}>
                <option value=""></option>
                {devices.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
              </TextField>
              <TextField select label="Auditory" SelectProps={{ native:true }} value={newBookingAuditory} onChange={e=>setNewBookingAuditory(e.target.value)}>
                <option value=""></option>
                {auditories.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </TextField>
              <Button onClick={createBooking} variant="contained">Add</Button>
            </Box>
            <Table>
              <TableHead>
                <TableRow><TableCell>ID</TableCell><TableCell>Device</TableCell><TableCell>Auditory</TableCell><TableCell>Actions</TableCell></TableRow>
              </TableHead>
              <TableBody>
                {bookings.map(b=>(
                  <TableRow key={b.id}>
                    <TableCell>{b.id}</TableCell>
                    <TableCell>{devices.find(d=>d.id===b.deviceId)?.name || b.deviceId}</TableCell>
                    <TableCell>{auditories.find(a=>a.id===b.auditoryId)?.name || b.auditoryId}</TableCell>
                    <TableCell>
                      <IconButton onClick={()=>deleteBooking(b.id)}><Delete/></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Box>
    </Container>
  )
}
