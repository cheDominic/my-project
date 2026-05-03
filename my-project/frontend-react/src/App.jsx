import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [items,      setItems]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [dbMsg,      setDbMsg]      = useState('확인 중...')
  const [dbOk,       setDbOk]       = useState(null)
  const [newName,    setNewName]    = useState('')
  const [newContent, setNewContent] = useState('')

  const checkDB = async () => {
    try {
      const res  = await fetch(`${API}/db-check`)
      const data = await res.json()
      setDbMsg(`연결됨 (총 ${data.items_count}건)`)
      setDbOk(true)
    } catch {
      setDbMsg('연결 실패'); setDbOk(false)
    }
  }

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res  = await fetch(`${API}/items`)
      const data = await res.json()
      setItems(Array.isArray(data) ? data : [])
      if (!Array.isArray(data)) setError(`API 응답 오류: ${JSON.stringify(data)}`)
    } catch (e) {
      setError(`API 오류: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async () => {
    await fetch(`${API}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, content: newContent })
    })
    setNewName(''); setNewContent('')
    fetchItems()
  }

  const deleteItem = async (id) => {
    await fetch(`${API}/items/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  useEffect(() => { checkDB(); fetchItems() }, [])

  const statusBg   = dbOk === null ? '#fef3c7' : dbOk ? '#d1fae5' : '#fee2e2'
  const statusColor = dbOk === null ? '#92400e' : dbOk ? '#065f46' : '#991b1b'

  const s = {
    app:     { maxWidth: '700px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
    h1:      { fontSize: '18px', margin: 0 },
    status:  { fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: statusBg, color: statusColor },
    nav:     { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', flexWrap: 'wrap', marginBottom: '24px' },
    navLabel:{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginRight: '4px' },
    navLink: { fontSize: '12px', color: '#3b82f6', textDecoration: 'none', padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px' },
    form:    { display: 'flex', gap: '8px', marginBottom: '20px' },
    input:   { flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' },
    btn:     { padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
    list:    { listStyle: 'none', padding: 0 },
    li:      { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderBottom: '1px solid #e5e7eb' },
    delBtn:  { padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
  }

  return (
    <div style={s.app}>
      <header>
        <div style={s.headerTop}>
          <h1 style={s.h1}>⚛️ React + FastAPI + Supabase</h1>
          <div style={s.status}>DB: {dbMsg}</div>
        </div>
        <nav style={s.nav}>
          <span style={s.navLabel}>📖 매뉴얼</span>
          <a href="/render-setup-manual.html" target="_blank" style={s.navLink}>
            🚀 Render 환경 구성 가이드
          </a>
          <a href="/fullstack-test-manual.html" target="_blank" style={s.navLink}>
            🔗 Full Stack 연결 테스트 가이드
          </a>
        </nav>
      </header>

      <div style={s.form}>
        <input value={newName}    onChange={e => setNewName(e.target.value)}    placeholder="이름" style={s.input} />
        <input value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="내용" style={{...s.input, flex: 2}} />
        <button onClick={addItem} disabled={!newName} style={s.btn}>추가</button>
      </div>

      {loading && <div style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>로딩 중...</div>}
      {error   && <div style={{ color: '#dc2626', padding: '12px', background: '#fee2e2', borderRadius: '6px' }}>{error}</div>}
      {!loading && !error && (
        <ul style={s.list}>
          {items.map(item => (
            <li key={item.id} style={s.li}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#9ca3af', width: '28px' }}>#{item.id}</span>
              <span style={{ fontWeight: 600, fontSize: '13px', width: '140px' }}>{item.name}</span>
              <span style={{ flex: 1, fontSize: '13px', color: '#6b7280' }}>{item.content}</span>
              <button onClick={() => deleteItem(item.id)} style={s.delBtn}>삭제</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}