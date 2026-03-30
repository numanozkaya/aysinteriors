# İç Mimarlık Portfolyo & Danışmanlık Sitesi — Claude Code Proje Spesifikasyonu

## Proje Özeti

"Elara Studio" adında bir iç mimarlık firması için tam işlevli, şık ve yönetilebilir bir web sitesi.
İki katmanlı yapı: ziyaretçilerin gördüğü vitrin sitesi + içerik yönetimi için şifre korumalı admin paneli.
Tek geliştirici dosyaları üretecek, harici veritabanı yok — tüm veriler localStorage'da tutulur.

## Teknik Yığın

- **Dil:** Vanilla HTML5 + CSS3 + JavaScript (ES Modules)
- **Dosya yapısı:** Çok dosyalı proje (aşağıda detaylandırılmış)
- **Veri depolama:** localStorage (JSON serialization)
- **Görsel yükleme:** FileReader API → base64 (admin panel)
- **Font:** Cormorant Garamond (başlıklar) + Jost (gövde) — Google Fonts
- **Ikon:** Lucide Icons (CDN)
- **Animasyon:** CSS transitions + Intersection Observer API
- **Dil:** Türkçe içerik, İngilizce kod

## Estetik Yön

**Ton:** Lüks editöryal — bir high-end mimarlık dergisinin dijital versiyonu.

**Renk paleti:**
- Zemin: `#F9F6F1` (kırık beyaz, kağıt tonu)
- Koyu: `#1C1A18` (neredeyse siyah, sıcak)
- Vurgu: `#C8A97A` (mat altın)
- İkincil: `#8C7B6E` (taupe)
- Sınır: `#E8E2D9`

**Tipografi:**
- H1-H3: Cormorant Garamond, italic, geniş letter-spacing
- Gövde: Jost, 300-400 weight, rahat line-height (1.8)

**Tasarım dili:** Bol negatif alan, asimetrik grid, ince çizgiler, hover'da yavaş fade efektleri.

**Animasyonlar:** Sayfa yüklenirken satır satır fade-in (staggered), scroll ile görüntüye giren bölümler soldan/aşağıdan süzülür.

---

## Dosya Yapısı

```
elara-studio/
├── index.html              # Ana sayfa (hero + öne çıkan projeler + CTA)
├── portfolio.html          # Portfolyo galerisi (filtrelenebilir kategoriler)
├── danismanlik.html        # Danışmanlık paketleri sayfası
├── hakkimda.html           # Tasarımcı hakkında biyografi sayfası
├── iletisim.html           # İletişim formu + bilgiler
├── admin/
│   ├── login.html          # Admin giriş sayfası
│   └── panel.html          # Admin kontrol paneli
└── css/
    └── style.css           # Global stiller (tüm sayfalar import eder)
```

---

## Vitrin Sayfaları — Detaylı Tasarım

### index.html — Ana Sayfa

**Hero Bölümü:**
- Tam ekran (100vh), arka plan: yüksek kaliteli bir iç mekan placeholder görsel (Unsplash URL)
- Üstünde yarı saydam koyu overlay
- Ortada: küçük harf italic "elara studio" + büyük Cormorant başlık "Mekânlar, Hikâye Anlatır"
- Alt kısımda ince yatay çizgi + "Portfolyoyu Keşfet" ve "Danışmanlık Al" iki buton (ghost style)
- Sağ alt köşede dikey yazılmış "Interior Design & Consultancy — Ankara" metni

**Öne Çıkan Projeler (3 kart):**
- localStorage'daki projelerden `featured: true` olanlar çekilir
- Masonry-benzeri asimetrik grid (1. kart büyük, 2-3 yan yana küçük)
- Hover'da görsel üzerine kategori + proje adı overlay geliyor, yavaşça
- "Tüm Projeleri Gör" CTA linki

**Hizmetler Özeti:**
- 3 kolon: Konsept Tasarım / Uygulama Takibi / Online Danışmanlık
- Her birinde ince ikon, başlık, 2 satır açıklama

**İstatistikler Bandı:**
- Koyu arka plan (#1C1A18), altın rakamlar
- "127 Proje" / "8 Yıl" / "4 Şehir" / "100% Müşteri Memnuniyeti"
- Sayfaya girildiğinde count-up animasyonu

---

### portfolio.html — Portfolyo Galerisi

**Kategori Filtresi:**
- Üstte yatay filtre butonları: Tümü / Salon / Mutfak / Banyo / Yatak Odası / Ofis / + admin'den eklenen kategoriler
- localStorage'dan kategoriler dinamik çekilir
- Aktif filtre altın rengi ile underline ile belli olur
- Filtre değişince kartlar fade-out → fade-in animasyonu (CSS transition)

**Proje Grid:**
- CSS Grid, 3 kolon (tablet: 2, mobil: 1)
- Her proje kartı: görsel (4:3 oran) + kategori tag + proje adı + şehir/yıl
- Hover: görsel hafif zoom, üstüne mat overlay + "İncele" yazısı
- Görsel tıklanınca lightbox modal açılır: büyük görsel + proje açıklaması + kullanılan malzemeler

**Lightbox Modal:**
- Tam ekran overlay, ESC ile kapanır
- Sol/sağ ok ile proje içindeki görseller arası geçiş
- Sağda proje metinleri: başlık, alan (m²), yıl, konum, açıklama, kullanılan malzemeler listesi

---

### danismanlik.html — Danışmanlık Paketleri

**Sayfa Başı:**
- Cormorant italic başlık: "Size Özel Tasarım Danışmanlığı"
- 2 paragraf açıklama metni (admin'den düzenlenebilir)

**Paket Kartları (dinamik, localStorage'dan):**
- Her paket bir kart: başlık + fiyat (opsiyonel) + özellikler listesi (bullet) + CTA butonu
- Öne çıkan paket varsa altın border + "En Popüler" badge
- Kartlar eşit yükseklikte, 3 kolon grid
- CTA butonu: "Paket Hakkında Bilgi Al" → iletisim.html?paket=xxx adresine yönlendirir

**SSS Bölümü:**
- Accordion tasarımı, tıklanınca açılır/kapanır
- Admin'den sorular/cevaplar eklenebilir

---

### hakkimda.html — Hakkımda

- Sol: tasarımcı portre görseli (admin'den yüklenir)
- Sağ: isim, unvan, biyografi (admin'den düzenlenir)
- Altta: eğitim ve sertifika timeline
- "Benimle Çalışın" CTA

---

### iletisim.html — İletişim

- Form: Ad Soyad, E-posta, Telefon, İlgilenilen Hizmet (dropdown), Mesaj
- Gönderilince localStorage'a kayıt + başarı animasyonu (gerçek mail sunucu yok)
- Sağda: e-posta, telefon, konum, sosyal medya ikonları (Instagram, Pinterest, LinkedIn)
- Altta Google Maps embed (konum iframe)

---

## Admin Panel — Detaylı Spesifikasyon

### admin/login.html

- Minimal, zarif giriş ekranı
- Logo + "Yönetici Girişi" başlığı
- Email ve şifre alanı
- Varsayılan giriş: `admin@elarastudio.com` / `elara2024` (localStorage'da saklanır, basit demo)
- Giriş başarılıysa `adminLoggedIn: true` sessionStorage'a yaz, panel.html'e yönlendir
- panel.html her açılışında bu kontrolü yapar, yoksa login'e atar

---

### admin/panel.html

**Üst Bar:**
- Sol: "Elara Studio — Admin Paneli" logosu
- Sağ: Siteyi Görüntüle linki + Çıkış Yap butonu

**Sol Kenar Çubuğu (250px):**
- Navigasyon linkleri:
  - 📁 Portfolyo Yönetimi
  - 📦 Danışmanlık Paketleri
  - 👤 Hakkımda & Profil
  - 💬 Mesajlar (iletişim formundan gelenler)
  - ⚙️ Site Ayarları

Her tıklamada ilgili bölüm açılır (SPA mantığı, tek sayfa içinde section show/hide).

---

### Bölüm 1: Portfolyo Yönetimi

**Kategori Yönetimi:**
- Mevcut kategoriler liste olarak gösterilir (sil butonu yanında)
- "Yeni Kategori Ekle" input + buton
- Kategoriler: id, name, slug alanlarına sahip

**Proje Listesi:**
- Her proje kart olarak listelenir: küçük thumbnail + proje adı + kategori + tarih + Düzenle/Sil butonları
- "Yeni Proje Ekle" butonu → form modal açılır

**Proje Ekleme/Düzenleme Formu (Modal):**
- Proje Adı (text)
- Kategori (select — dinamik, eklenen kategorilerden)
- Konum / Şehir (text)
- Yıl (number)
- Alan m² (number, opsiyonel)
- Açıklama (textarea)
- Kullanılan Malzemeler (textarea, virgülle ayrılmış)
- Öne Çıkar (checkbox) — anasayfada göster
- **Görsel Yükleme:** Birden fazla dosya seçilebilir (multiple file input)
  - FileReader API ile her görsel base64'e çevrilir
  - Yüklenen görseller küçük thumbnail olarak önizlenir
  - Her thumbnail'in sağ üstünde × ikonu (kaldırma)
  - İlk görsel "kapak görseli" olarak işaretlenir (yıldız ikonu)
- Kaydet / İptal butonları

**Veri Yapısı (localStorage key: `elara_projects`):**

```json
[
  {
    "id": "proj_1234",
    "title": "Modern Salon Tasarımı",
    "category": "salon",
    "location": "Ankara",
    "year": 2023,
    "area": 45,
    "description": "...",
    "materials": ["Mermer", "Ahşap", "Paslanmaz Çelik"],
    "featured": true,
    "images": ["data:image/jpeg;base64,...", "data:image/jpeg;base64,..."],
    "coverIndex": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### Bölüm 2: Danışmanlık Paketleri

**Paket Listesi:**
- Mevcut paketler kart olarak listelenir
- Sıralama: yukarı/aşağı ok ile manuel sıralama
- Düzenle / Sil / Öne Çıkar butonları

**Paket Ekleme/Düzenleme Formu:**
- Paket Başlığı (text) — örn. "Temel Danışmanlık"
- Kısa Slogan (text) — örn. "Hızlı ve etkili çözümler"
- Fiyat (text, opsiyonel) — örn. "₺2.500'den başlayan"
- Özellikler Listesi (textarea, her satır bir özellik — satırlar otomatik madde işareti olarak render edilir)
- Öne Çıkan Paket (checkbox)
- CTA Buton Metni (text) — örn. "Bu Paketi Seç"
- Renk Teması (radio): Standart (kırık beyaz) / Vurgulu (altın border) / Koyu
- Sınırsız paket eklenebilir

**Veri Yapısı (localStorage key: `elara_packages`):**

```json
[
  {
    "id": "pkg_001",
    "title": "Temel Danışmanlık",
    "slogan": "Hızlı ve etkili çözümler",
    "price": "₺2.500'den başlayan",
    "features": [
      "1 oda konsept tasarımı",
      "3D görselleştirme",
      "Malzeme önerileri",
      "2 revizyon hakkı"
    ],
    "featured": false,
    "ctaText": "Bu Paketi Seç",
    "theme": "standard",
    "order": 1
  }
]
```

---

### Bölüm 3: Hakkımda & Profil

**Form Alanları:**
- Ad Soyad
- Unvan (örn. "İç Mimar & Tasarım Danışmanı")
- Kısa Bio (textarea)
- Uzun Bio (textarea — hakkimda.html'de kullanılır)
- Profil Görseli (file upload → base64)
- Eğitim (dinamik liste: okul + bölüm + yıl, ekle/sil)
- Sertifikalar (dinamik liste: isim + kurum + yıl)
- E-posta, Telefon, Instagram, Pinterest, LinkedIn

---

### Bölüm 4: Mesajlar

- İletişim formundan gelen mesajlar tablo olarak listelenir
- Her satır: ad, e-posta, hizmet türü, tarih, "Okundu/Okunmadı" badge
- Tıklanınca tam mesaj modal'da açılır
- Okundu olarak işaretle / Sil butonları
- Okunmamış mesaj sayısı sol menüde badge olarak gösterilir

---

### Bölüm 5: Site Ayarları

- Site Başlığı (text)
- Site Açıklaması / SEO description (textarea)
- Ana Sayfa Hero Görseli (file upload → base64)
- Hakkımda sayfası ek görseli
- Footer metni
- Google Maps iframe URL'si
- Şifre değiştir (eski şifre + yeni şifre + onay)

---

## Global Özellikler

**Navigasyon (tüm sayfalarda):**
- Sticky top navbar, scroll'da arka plan blur efekti (backdrop-filter)
- Sol: "elara studio" logosu (Cormorant Garamond italic)
- Sağ: Ana Sayfa / Portfolyo / Danışmanlık / Hakkımda / İletişim + "Danışmanlık Al" CTA butonu
- Mobilde hamburger menü

**Footer (tüm sayfalarda):**
- 3 kolon: Logo + kısa açıklama / Hızlı Linkler / İletişim
- Alt bant: copyright + "Admin Girişi" gizli linki

**Performans:**
- Görsel lazy loading (`loading="lazy"` + Intersection Observer)
- CSS animasyonlar GPU-accelerated (transform, opacity kullan)
- localStorage okuma hatalarına try/catch

**Erişilebilirlik:**
- aria-label'lar kritik elemanlarda
- Focus stilleri görünür
- Alt metinleri admin'de zorunlu alan

---

## Başlangıç Verileri (Seed Data)

Uygulama ilk açıldığında (localStorage boşsa) örnek verilerle doldur:

- 6 örnek proje (2 salon, 1 mutfak, 1 banyo, 1 yatak odası, 1 ofis)
  - Görseller: Unsplash iç mekan fotoğraflarından direkt URL
- 3 danışmanlık paketi (Temel / Profesyonel / Premium)
- Admin bilgileri ve örnek hakkımda metni

---

## Teslim Formatı

Tüm dosyaları sırayla, tam ve çalışır halde yaz. Her dosyayı ilgili kod bloğu içinde ver.
Dosyalar arasındaki bağımlılıklar çalışır olmalı (CSS import, localStorage key'leri tutarlı).
Seed data script'i index.html'de çalışır ve diğer sayfalar bu veriyi kullanır.