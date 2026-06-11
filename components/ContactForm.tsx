'use client'
import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContactForm({ defaultService }: { defaultService?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const supabase = createClient()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const fd = new FormData(e.currentTarget)

    const { error } = await supabase.from('messages').insert({
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      phone: (fd.get('phone') as string) || null,
      service: (fd.get('service') as string) || null,
      message: fd.get('message') as string,
    })

    setStatus(error ? 'error' : 'success')
  }

  if (status === 'success') {
    return (
      <div className="form-success">
        <h3>Mesajınız İletildi</h3>
        <p>En kısa sürede size dönüş yapacağız.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="name">Ad Soyad *</label>
        <input type="text" id="name" name="name" required placeholder="Adınız Soyadınız" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label htmlFor="email">E-posta *</label>
          <input type="email" id="email" name="email" required placeholder="ornek@mail.com" />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Telefon</label>
          <input type="tel" id="phone" name="phone" placeholder="+90 5xx xxx xx xx" />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="service">İlgilenilen Hizmet</label>
        <select id="service" name="service" defaultValue={defaultService ?? ''}>
          <option value="">Seçiniz</option>
          <option value="Konsept Tasarım">Konsept Tasarım</option>
          <option value="Uygulama Takibi">Uygulama Takibi</option>
          <option value="Online Danışmanlık">Online Danışmanlık</option>
          <option value="Diğer">Diğer</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="message">Mesajınız *</label>
        <textarea id="message" name="message" rows={5} required placeholder="Projeniz hakkında bilgi verin..." />
      </div>
      {status === 'error' && <p style={{ color: '#c0392b', marginBottom: '1rem' }}>Bir hata oluştu, lütfen tekrar deneyin.</p>}
      <button type="submit" disabled={status === 'sending'} style={{ width: '100%', padding: '14px', background: 'transparent', border: '1px solid var(--dark)', fontFamily: 'var(--font-body)', fontSize: '.8rem', letterSpacing: '.12em', textTransform: 'uppercase', cursor: 'pointer' }}>
        {status === 'sending' ? 'Gönderiliyor…' : 'Mesaj Gönder'}
      </button>
    </form>
  )
}
