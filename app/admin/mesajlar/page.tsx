'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import type { Message } from '@/lib/types'

export default function AdminMesajlarPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [selected, setSelected] = useState<Message | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    setMessages(data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  async function open(msg: Message) {
    setSelected(msg)
    if (!msg.is_read) {
      await supabase.from('messages').update({ is_read: true }).eq('id', msg.id)
      setMessages(m => m.map(x => x.id === msg.id ? { ...x, is_read: true } : x))
    }
  }

  async function del(id: string) {
    if (!confirm('Mesajı silmek istiyor musunuz?')) return
    await supabase.from('messages').delete().eq('id', id)
    setMessages(m => m.filter(x => x.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div>
      <div className="section-title">Mesajlar</div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {messages.length === 0 && <p style={{ padding: 20, color: 'var(--taupe)' }}>Henüz mesaj yok.</p>}
        {messages.map(msg => (
          <div key={msg.id} className={`msg-row${!msg.is_read ? ' unread' : ''}`} onClick={() => open(msg)}>
            <div className="msg-row-top">
              <span className="msg-name">{msg.name}</span>
              <span className="msg-date">{new Date(msg.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
            <div className="msg-preview">{msg.email}{msg.service ? ` · ${msg.service}` : ''}</div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay open">
          <div className="modal-box">
            <div className="modal-head">
              <span className="modal-head-title">{selected.name}</span>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <p><strong>E-posta:</strong> <a href={`mailto:${selected.email}`}>{selected.email}</a></p>
              {selected.phone && <p><strong>Telefon:</strong> {selected.phone}</p>}
              {selected.service && <p><strong>Hizmet:</strong> {selected.service}</p>}
              <p style={{ marginTop: 16 }}>{selected.message}</p>
              <p style={{ marginTop: 16, fontSize: 11, color: 'var(--taupe)' }}>{new Date(selected.created_at).toLocaleString('tr-TR')}</p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-danger" onClick={() => del(selected.id)}><Trash2 size={13} /> Sil</button>
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
