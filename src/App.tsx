// src/App.tsx
import React from 'react'
import { api, setBrandCSSVars, getToken, setToken, getUser, setUser, type AuthUser } from './api'

type UserForm = { name: string; email: string; password: string; role: string; location: string; }

export default function App(){
  const [status, setStatus] = React.useState<string>('')
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(getUser())
  const [userForm, setUserForm] = React.useState<UserForm>({ name:'', email:'', password:'', role:'Employee', location:'' })
  const [item, setItem] = React.useState({ title:'', description:'', price: 0, createdBy: getUser()?.numericId ?? 1 })
  const [items, setItems] = React.useState<any[]>([])
  const [group, setGroup] = React.useState({ name:'', location:'', memberIds: [ (getUser()?.numericId ?? 1) ] })
  const [groups, setGroups] = React.useState<any[]>([])

  React.useEffect(() => { setBrandCSSVars() }, [])
  React.useEffect(() => {
    const uid = authUser?.numericId ?? 1
    setItem(i => ({ ...i, createdBy: uid }))
    setGroup(g => ({ ...g, memberIds: [uid] }))
  }, [authUser])

  const register = async () => {
    try {
      await api('/api/User/register', { method:'POST', body: JSON.stringify(userForm) })
      setStatus('Registered ✔ — now log in')
    } catch (e:any){ setStatus(e.message) }
  }

  const login = async () => {
    try {
      const res = await api<{ token:string; user:any }>('/api/User/login', {
        method:'POST',
        body: JSON.stringify({ email: userForm.email, password: userForm.password })
      })
      setToken(res.token)
      setStatus('Logged in ✔ — fetching profile...')
      const me = await api<AuthUser>('/api/User/me', {}, true)
      setUser(me); setAuthUser(me)
      setStatus(`Welcome, ${me.name} ✔`)
    } catch (e:any){ setStatus(e.message) }
  }

  const logout = () => {
    setToken(null); setUser(null); setAuthUser(null)
    setStatus('Logged out')
  }

  const createItem = async () => {
    try {
      await api('/api/Marketplace/create', { method:'POST', body: JSON.stringify(item) }, true)
      setStatus('Item created ✔'); await loadItems()
    } catch (e:any){ setStatus(e.message) }
  }
  const loadItems = async () => {
    try { setItems(await api<any[]>('/api/Marketplace', {}, true)) }
    catch (e:any){ setStatus(e.message) }
  }

  const createGroup = async () => {
    try {
      await api('/api/Group/create', { method:'POST', body: JSON.stringify(group) }, true)
      setStatus('Group created ✔'); await loadGroups()
    } catch (e:any){ setStatus(e.message) }
  }
  const loadGroups = async () => {
    try { setGroups(await api<any[]>('/api/Group/by-location/' + encodeURIComponent(group.location || 'LS1'), {}, true)) }
    catch (e:any){ setStatus(e.message) }
  }

  const token = getToken()

  return (
    <div className="app">
      <h1>WellbeingHub</h1>
      <div className="notice">
        API Base: {import.meta.env.VITE_API_BASE_URL || '(not set)'} • {authUser ? `Signed in as ${authUser.name}` : 'Not signed in'}
      </div>

      <section className="card">
        <h3>1) Register / Login</h3>
        <div className="row">
          <div><label>Name</label><input value={userForm.name} onChange={e=>setUserForm({...userForm, name:e.target.value})} /></div>
          <div><label>Email</label><input value={userForm.email} onChange={e=>setUserForm({...userForm, email:e.target.value})} /></div>
          <div><label>Password</label><input type="password" value={userForm.password} onChange={e=>setUserForm({...userForm, password:e.target.value})} /></div>
          <div>
            <label>Role</label>
            <select value={userForm.role} onChange={e=>setUserForm({...userForm, role:e.target.value})}>
              <option>Employee</option>
              <option>Admin</option>
            </select>
          </div>
          <div><label>Location</label><input value={userForm.location} onChange={e=>setUserForm({...userForm, location:e.target.value})} /></div>
        </div>
        <div style={{ display:'flex', gap:12, marginTop:12 }}>
          <button onClick={register}>Register</button>
          <button className="secondary" onClick={login}>Login</button>
          {authUser && <button onClick={logout}>Logout</button>}
        </div>
      </section>

      <section className="card">
        <h3>2) Marketplace</h3>
        <div className="row">
          <div><label>Title</label><input value={item.title} onChange={e=>setItem({...item, title:e.target.value})}/></div>
          <div><label>Description</label><input value={item.description} onChange={e=>setItem({...item, description:e.target.value})}/></div>
          <div><label>Price</label><input type="number" value={item.price} onChange={e=>setItem({...item, price:Number(e.target.value)})}/></div>
          <div><label>CreatedBy (auto from user)</label><input type="number" value={item.createdBy} onChange={e=>setItem({...item, createdBy:Number(e.target.value)})}/></div>
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

