import React from 'react'
import { api } from './api'

type User = {
  name: string; email: string; password: string; role: string; location: string;
}

export default function App(){
  const [token, setToken] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState<string>('')
  const [user, setUser] = React.useState<User>({ name:'', email:'', password:'', role:'Employee', location:'' })
  const [item, setItem] = React.useState({ title:'', description:'', price: 0, createdBy: 1 })
  const [items, setItems] = React.useState<any[]>([])
  const [group, setGroup] = React.useState({ name:'', location:'', memberIds: [1] })
  const [groups, setGroups] = React.useState<any[]>([])

  const register = async () => {
    try {
      await api('/api/User/register', { method:'POST', body: JSON.stringify(user) })
      setStatus('Registered ✔')
    } catch (e:any){ setStatus(e.message) }
  }
  const login = async () => {
    try {
      const res = await api('/api/User/login', { method:'POST', body: JSON.stringify({ email: user.email, password: user.password }) })
      setToken(res.token); setStatus('Logged in ✔')
    } catch (e:any){ setStatus(e.message) }
  }
  const createItem = async () => {
    try {
      await api('/api/Marketplace/create', { method:'POST', body: JSON.stringify(item) }, token!)
      setStatus('Item created ✔')
      await loadItems()
    } catch (e:any){ setStatus(e.message) }
  }
  const loadItems = async () => {
    try {
      const res = await api('/api/Marketplace', {}, token!)
      setItems(res)
    } catch (e:any){ setStatus(e.message) }
  }
  const createGroup = async () => {
    try {
      await api('/api/Group/create', { method:'POST', body: JSON.stringify(group) }, token!)
      setStatus('Group created ✔')
      await loadGroups()
    } catch (e:any){ setStatus(e.message) }
  }
  const loadGroups = async () => {
    try {
      const res = await api('/api/Group/by-location/' + encodeURIComponent(group.location || 'LS1'), {}, token!)
      setGroups(res)
    } catch (e:any){ setStatus(e.message) }
  }

  return (
    <div className="app">
      <h1>WellbeingHub</h1>
      <div className="notice">API Base: {import.meta.env.VITE_API_BASE_URL || '(not set)'}</div>

      <section className="card">
        <h3>1) Register</h3>
        <div className="row">
          <div>
            <label>Name</label>
            <input value={user.name} onChange={e=>setUser({...user, name:e.target.value})} />
          </div>
          <div>
            <label>Email</label>
            <input value={user.email} onChange={e=>setUser({...user, email:e.target.value})} />
          </div>
          <div>
            <label>Password</label>
            <input type="password" value={user.password} onChange={e=>setUser({...user, password:e.target.value})} />
          </div>
          <div>
            <label>Role</label>
            <select value={user.role} onChange={e=>setUser({...user, role:e.target.value})}>
              <option>Employee</option>
              <option>Admin</option>
            </select>
          </div>
          <div>
            <label>Location</label>
            <input value={user.location} onChange={e=>setUser({...user, location:e.target.value})} />
          </div>
        </div>
        <div style={{ display:'flex', gap:12, marginTop:12 }}>
          <button onClick={register}>Register</button>
          <button className="secondary" onClick={login}>Login</button>
        </div>
      </section>

      <section className="card">
        <h3>2) Marketplace</h3>
        <div className="row">
          <div><label>Title</label><input value={item.title} onChange={e=>setItem({...item, title:e.target.value})}/></div>
          <div><label>Description</label><input value={item.description} onChange={e=>setItem({...item, description:e.target.value})}/></div>
          <div><label>Price</label><input type="number" value={item.price} onChange={e=>setItem({...item, price:Number(e.target.value)})}/></div>
          <div><label>CreatedBy (numericId)</label><input type="number" value={item.createdBy} onChange={e=>setItem({...item, createdBy:Number(e.target.value)})}/></div>
        </div>
        <div style={{ display:'flex', gap:12, marginTop:12 }}>
          <button onClick={createItem} disabled={!token}>Create item</button>
          <button className="secondary" onClick={loadItems} disabled={!token}>Refresh list</button>
        </div>
        {items.map((it, idx)=>(
          <div className="card" key={idx}>
            <strong>{it.title}</strong> — £{it.price}<br/>
            <span className="notice">{it.description}</span>
          </div>
        ))}
      </section>

      <section className="card">
        <h3>3) Groups</h3>
        <div className="row">
          <div><label>Name</label><input value={group.name} onChange={e=>setGroup({...group, name:e.target.value})}/></div>
          <div><label>Location</label><input value={group.location} onChange={e=>setGroup({...group, location:e.target.value})}/></div>
        </div>
        <div style={{ display:'flex', gap:12, marginTop:12 }}>
          <button onClick={createGroup} disabled={!token}>Create group</button>
          <button className="secondary" onClick={loadGroups} disabled={!token}>List by location</button>
        </div>
        {groups.map((g, idx)=>(
          <div className="card" key={idx}>
            <strong>{g.name}</strong> — {g.location}<br/>
            <span className="notice">Members: {Array.isArray(g.memberIds) ? g.memberIds.join(', ') : ''}</span>
          </div>
        ))}
      </section>

      <hr/>
      <div className="notice">Status: {status}</div>
      <div className="notice">Token: {token ? token.slice(0,20)+'…' : '(not set)'}</div>
    </div>
  )
}
