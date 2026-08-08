import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type View = 'landing' | 'dashboard' | 'auth' | 'editor' | 'publish'

// ─── Particle ────────────────────────────────────────────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        ...style,
        animation: `particleFloat ${style['--dur' as string] || '8s'} ease-in-out infinite`,
        animationDelay: style['--delay' as string] || '0s',
      }}
    />
  )
}

// ─── Floating Polaroids ───────────────────────────────────────────────────────
const polaroidData = [
  { img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=220&fit=crop&auto=format', label: 'Best friends ♥', rotate: '-8deg', top: '8%', left: '3%', delay: '0s', dur: '5s' },
  { img: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200&h=220&fit=crop&auto=format', label: 'Our wedding day', rotate: '6deg', top: '5%', right: '4%', delay: '1s', dur: '6s' },
  { img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=180&h=200&fit=crop&auto=format', label: 'Happy birthday!', rotate: '-4deg', bottom: '18%', left: '2%', delay: '2s', dur: '7s' },
  { img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=180&h=200&fit=crop&auto=format', label: 'Adventure awaits', rotate: '7deg', bottom: '12%', right: '3%', delay: '0.5s', dur: '5.5s' },
]

function FloatingPolaroid({ data }: { data: typeof polaroidData[0] }) {
  const posStyle: React.CSSProperties = {}
  if (data.top) posStyle.top = data.top
  if (data.bottom) posStyle.bottom = data.bottom
  if (data.left) posStyle.left = data.left
  if (data.right) posStyle.right = data.right

  return (
    <div
      className="absolute polaroid hidden lg:block"
      style={{
        ...posStyle,
        transform: `rotate(${data.rotate})`,
        '--r': data.rotate,
        animation: `float ${data.dur} ease-in-out infinite`,
        animationDelay: data.delay,
        zIndex: 2,
        width: 160,
      } as React.CSSProperties}
    >
      <img src={data.img} alt={data.label} className="w-full aspect-square object-cover" />
      <p className="text-center mt-2 text-xs" style={{ fontFamily: 'cursive', color: '#9A7FD0', lineHeight: 1.3 }}>{data.label}</p>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onAuth, onDash, view }: { onAuth: () => void; onDash: () => void; view: View }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(250,247,242,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(201,168,76,0.15)' : 'none',
        padding: scrolled ? '12px 0' : '20px 0',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <button
          onClick={() => { window.scrollTo(0,0) }}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #9A7FD0, #B8A5E0)' }}>
            <span className="text-sm">🪺</span>
          </div>
          <span className="font-serif text-xl font-semibold" style={{ color: '#9A7FD0' }}>JoyNest</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {['Templates', 'Features', 'Pricing', 'Gallery'].map(item => (
            <a key={item} href="#" className="text-sm font-medium transition-colors duration-200 hover:text-[#DCD0FF]" style={{ color: '#A0A0A0' }}>
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAuth}
            className="btn-gold text-sm font-medium px-4 py-2 rounded-full"
          >
            Sign in
          </button>
          <button
            onClick={onDash}
            className="btn-forest text-sm font-medium px-5 py-2 rounded-full"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ onStart }: { onStart: () => void }) {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    bottom: '-20px',
    width: `${6 + Math.random() * 10}px`,
    height: `${6 + Math.random() * 10}px`,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    background: ['rgba(201,168,76,0.5)', 'rgba(183,110,121,0.4)', 'rgba(143,175,143,0.5)', 'rgba(197,184,212,0.5)'][Math.floor(Math.random() * 4)],
    '--dur': `${8 + Math.random() * 10}s`,
    '--delay': `${Math.random() * 8}s`,
  }))

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(165deg, #F8F6F8 0%, #F4F0FF 40%, #F8F6F8 70%, #E8E2FF 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-30 animate-pulse-soft"
          style={{ background: 'radial-gradient(circle, #DCD0FF 0%, transparent 70%)', top: '10%', left: '15%' }} />
        <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #B8A5E0 0%, transparent 70%)', bottom: '20%', right: '20%',
          animation: 'pulse-soft 4s ease-in-out 1.5s infinite' }} />
        <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #D8D0E8 0%, transparent 70%)', top: '50%', right: '30%',
          animation: 'pulse-soft 5s ease-in-out 0.8s infinite' }} />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => <Particle key={i} style={p as React.CSSProperties} />)}
      </div>

      {/* Floating polaroids */}
      {polaroidData.map((p, i) => <FloatingPolaroid key={i} data={p} />)}

      {/* Hero content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="animate-fadeInUp delay-100 inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <span className="text-xs">✨</span>
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: '#DCD0FF' }}>Memory making, reimagined</span>
        </div>

        <h1 className="font-serif animate-fadeInUp delay-200" style={{ fontSize: 'clamp(3rem, 7vw, 6.5rem)', lineHeight: 1.05, color: '#9A7FD0', letterSpacing: '-0.02em' }}>
          Preserve Moments.<br />
          <em style={{ color: '#DCD0FF', fontStyle: 'italic' }}>Share Memories.</em><br />
          Create Joy.
        </h1>

        <p className="animate-fadeInUp delay-300 mt-6 text-lg leading-relaxed max-w-xl mx-auto"
          style={{ color: '#A0A0A0', fontWeight: 300 }}>
          Build beautiful interactive memory websites in minutes. For birthdays, weddings, travel,
          and every precious moment in between.
        </p>

        <div className="animate-fadeInUp delay-400 flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <button
            onClick={onStart}
            className="btn-forest font-medium px-8 py-4 rounded-full text-base"
          >
            <span>Get Started</span>
          </button>
          <button 
            onClick={() => {
              // Scroll to templates section
              const templatesSection = document.getElementById('templates');
              if (templatesSection) {
                templatesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="btn-gold font-medium px-8 py-4 rounded-full text-base"
          >
            <span>Explore Templates</span>
          </button>
          <button 
            onClick={() => {
              // For now, show a simple alert - can be replaced with demo modal
              alert('Demo coming soon! For now, create an account to try the full experience.');
            }}
            className="btn-forest font-medium px-8 py-4 rounded-full text-base"
            style={{ opacity: 0.7 }}
          >
            <span>Watch Demo</span>
          </button>
        </div>

        <div className="animate-fadeInUp delay-500 flex items-center justify-center gap-8 mt-12">
          {[
            { n: '10k+', l: 'Memories created', icon: '✨' },
            { n: '98%', l: 'Love it', icon: '💝' },
            { n: '4.9★', l: 'App rating', icon: '⭐' }
          ].map((stat, i) => (
            <div key={stat.l} className="text-center group">
              <div className="font-serif text-3xl font-semibold text-glow-gold" style={{ color: '#DCD0FF' }}>{stat.n}</div>
              <div className="text-xs mt-1 flex items-center justify-center gap-1" style={{ color: '#A0A0A0' }}>
                <span className="animate-bounceSoft" style={{ animationDelay: `${i * 0.2}s` }}>{stat.icon}</span>
                {stat.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50" style={{ color: '#A0A0A0' }}>
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

// ─── Features Section ─────────────────────────────────────────────────────────
const features = [
  { icon: '📖', title: 'Interactive Journals', desc: 'Flip through beautifully crafted pages with handwritten fonts, stickers, and washi tape accents.', color: '#F4F0FF', badge: 'Popular' },
  { icon: '🎙️', title: 'Voice Notes', desc: 'Capture the warmth of a voice. Record messages that play as visitors scroll through your story.', color: '#E8E2FF', badge: 'New' },
  { icon: '🖼️', title: 'Memory Gallery', desc: 'A cinematic masonry gallery with lightbox, captions, albums, and seamless drag-to-upload.', color: '#F2EEF8', badge: null },
  { icon: '🎵', title: 'Background Music', desc: 'Set the mood with a curated playlist or your own tracks. Vinyl player animations included.', color: '#F4F0FF', badge: null },
  { icon: '🔐', title: 'Password Protection', desc: 'Keep private memories safe with elegant password protection and invite-only access.', color: '#E8E2FF', badge: 'Secure' },
  { icon: '⏳', title: 'Memory Timeline', desc: 'Tell your story chronologically with a beautiful interactive timeline that unfolds as you scroll.', color: '#F2EEF8', badge: null },
]

function FeaturesSection() {
  return (
    <section className="py-32 px-6" style={{ background: '#F8F6F8' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: '#DCD0FF' }}>Why JoyNest</p>
          <h2 className="font-serif" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: '#9A7FD0', lineHeight: 1.1 }}>
            Everything a memory deserves
          </h2>
          <p className="mt-4 text-base max-w-xl mx-auto" style={{ color: '#A0A0A0', fontWeight: 300 }}>
            Not just a website builder — a feeling. Each feature is designed to make your memories come alive.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="gradient-border card-hover rounded-2xl p-8 cursor-pointer group relative overflow-hidden"
              style={{
                background: f.color,
                border: '1px solid rgba(28,58,42,0.06)',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {f.badge && (
                <div className="absolute top-4 right-4">
                  <span className={`badge ${f.badge === 'Popular' ? 'badge-gold' : f.badge === 'New' ? 'badge-rose' : 'badge-sage'}`}>
                    {f.badge}
                  </span>
                </div>
              )}
              <div className="text-5xl mb-5 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 inline-block animate-rotateFloat" style={{ animationDelay: `${i * 0.2}s` }}>{f.icon}</div>
              <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: '#9A7FD0' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#A0A0A0' }}>{f.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color: '#DCD0FF' }}>
                Learn more <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Templates Section ────────────────────────────────────────────────────────
const templates = [
  { name: 'Birthday Delight', tag: 'birthday', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop&auto=format', palette: ['#B8A5E0', '#F4F0FF', '#DCD0FF'], rating: 4.9 },
  { name: 'Wedding Story', tag: 'wedding', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=280&fit=crop&auto=format', palette: ['#F8F6F8', '#DCD0FF', '#A0A0A0'], rating: 4.8 },
  { name: 'Love Letters', tag: 'romance', img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=280&fit=crop&auto=format', palette: ['#F2EEF8', '#B8A5E0', '#F4F0FF'], rating: 4.7 },
  { name: 'Travel Diaries', tag: 'travel', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=280&fit=crop&auto=format', palette: ['#E8E2FF', '#9A7FD0', '#DCD0FF'], rating: 4.8 },
  { name: 'Graduation Day', tag: 'graduation', img: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=280&fit=crop&auto=format', palette: ['#F4F0FF', '#B8A5E0', '#DCD0FF'], rating: 4.6 },
  { name: 'Family Album', tag: 'family', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=280&fit=crop&auto=format', palette: ['#F8F6F8', '#D8D0E8', '#B8A5E0'], rating: 4.9 },
]

function TemplatesSection({ onStart, onAuth }: { onStart: () => void; onAuth: () => void }) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="templates" className="py-32 px-6" style={{ background: 'linear-gradient(180deg, #F8F6F8 0%, #F4F0FF 100%)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-sm font-medium tracking-widest uppercase mb-4" style={{ color: '#DCD0FF' }}>Templates</p>
            <h2 className="font-serif" style={{ fontSize: 'clamp(2.2rem, 4vw, 3.5rem)', color: '#9A7FD0', lineHeight: 1.1 }}>
              Start from something<br /><em>beautiful</em>
            </h2>
          </div>
          <button className="self-start md:self-auto text-sm font-medium px-6 py-3 rounded-full transition-all duration-200"
            style={{ border: '1px solid rgba(28,58,42,0.2)', color: '#9A7FD0' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#9A7FD0', e.currentTarget.style.color = '#F8F6F8')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = '#9A7FD0')}>
            View all templates →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t, i) => (
            <div
              key={t.name}
              className="gradient-border rounded-2xl overflow-hidden cursor-pointer group relative"
              style={{ 
                boxShadow: hovered === i ? '0 24px 60px rgba(28,58,42,0.14)' : '0 4px 20px rgba(28,58,42,0.06)',
                transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                transform: hovered === i ? 'translateY(-6px)' : 'none',
                border: '1px solid rgba(28,58,42,0.06)',
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="relative overflow-hidden" style={{ height: 200 }}>
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(28,58,42,0.6) 100%)',
                    opacity: hovered === i ? 1 : 0 }} />

                {/* Rating badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
                  <span className="text-xs">⭐</span>
                  <span className="text-xs font-semibold" style={{ color: '#9A7FD0' }}>{t.rating}</span>
                </div>

                {/* Palette dots */}
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {t.palette.map(c => (
                    <div key={c} className="w-4 h-4 rounded-full border-2 border-white shadow-sm animate-pulseSoft" style={{ background: c, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>

                {/* Hover actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300"
                  style={{ opacity: hovered === i ? 1 : 0 }}>
                  <button
                    onClick={onAuth}
                    className="btn-gold text-xs font-semibold px-4 py-2 rounded-full"
                    style={{ transform: hovered === i ? 'translateY(0)' : 'translateY(8px)', transition: 'transform 0.3s ease 0.05s' }}>
                    <span>Use This</span>
                  </button>
                  <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.9)', transform: hovered === i ? 'translateY(0)' : 'translateY(8px)', transitionDelay: '0.1s' }}>
                    <span className="text-sm">👁️</span>
                  </button>
                </div>
              </div>

              <div className="p-5" style={{ background: '#F8F6F8' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif font-semibold text-base" style={{ color: '#9A7FD0' }}>{t.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">⭐</span>
                    <span className="text-xs font-medium" style={{ color: '#DCD0FF' }}>{t.rating}</span>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize inline-block"
                  style={{ background: '#F4F0FF', color: '#A0A0A0' }}>{t.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  { name: 'Amara Osei', role: 'Made a birthday site for her mother', quote: "She cried. I cried. Everyone cried. JoyNest turned a few photos and words into something I'll treasure forever.", avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format', rating: 5 },
  { name: 'Luca Ferretti', role: 'Wedding anniversary gift', quote: "My wife said it was the most romantic thing I'd ever done. The page-flip journals and voice notes made it feel like magic.", avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format', rating: 5 },
  { name: 'Yuna Tanaka', role: 'Graduation surprise for friends', quote: "We built a surprise site for our whole friend group. The gallery and music made it feel like a film. So much love in one place.", avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&auto=format', rating: 5 },
]

function TestimonialsSection() {
  return (
    <section className="py-32 px-6" style={{ background: '#9A7FD0' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-medium tracking-widest uppercase mb-4 text-gold-shimmer" style={{ color: '#DCD0FF' }}>Loved by thousands</p>
          <h2 className="font-serif text-white" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1 }}>
            Moments that made people<br /><em style={{ color: '#DCD0FF' }}>smile</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="gradient-border card-hover rounded-2xl p-7 relative overflow-hidden"
              style={{ 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(201,168,76,0.2)',
                animationDelay: `${i * 0.15}s`
              }}
            >
              <div className="flex gap-1 mb-5">
                {[...Array(t.rating)].map((_, i) => (
                  <span key={i} className="animate-bounceSoft" style={{ color: '#DCD0FF', animationDelay: `${i * 0.1}s` }}>★</span>
                ))}
              </div>
              <blockquote className="text-base leading-relaxed mb-6 italic"
                style={{ color: 'rgba(250,247,242,0.85)', fontFamily: 'var(--font-serif)', fontWeight: 400 }}>
                "{t.quote}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover animate-rotateFloat" style={{ border: '2px solid rgba(201,168,76,0.4)', animationDelay: `${i * 0.2}s` }} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full" style={{ background: '#DCD0FF' }} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: '#F8F6F8' }}>{t.name}</div>
                  <div className="text-xs" style={{ color: 'rgba(250,247,242,0.5)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-32 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(165deg, #F8F6F8 0%, #F4F0FF 50%, #F8F6F8 100%)' }}>
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 animate-pulseSoft" style={{ background: 'radial-gradient(circle, #DCD0FF, transparent 70%)' }} />
      <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full opacity-20 animate-pulseSoft" style={{ background: 'radial-gradient(circle, #B8A5E0, transparent 70%)', animationDelay: '1s' }} />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fadeInUp" style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)' }}>
          <span className="text-sm animate-bounceSoft">✨</span>
          <span className="text-sm font-medium tracking-wider uppercase" style={{ color: '#DCD0FF' }}>Start creating today</span>
        </div>
        
        <h2 className="font-serif text-glow-gold animate-fadeInUp delay-100" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#9A7FD0', lineHeight: 1.05 }}>
          Your memories deserve<br /><em style={{ color: '#DCD0FF' }}>more than just photos</em>
        </h2>
        
        <p className="mt-6 text-lg leading-relaxed max-w-xl mx-auto animate-fadeInUp delay-200" style={{ color: '#A0A0A0', fontWeight: 300 }}>
          Join thousands of people who have turned their precious moments into beautiful, interactive memory websites.
        </p>
        
        <div className="animate-fadeInUp delay-300 flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <button
            onClick={onStart}
            className="btn-forest font-medium px-10 py-4 rounded-full text-base"
          >
            <span>Start Free Now</span>
          </button>
          <button className="flex items-center gap-2 px-8 py-4 rounded-full font-medium text-base transition-all duration-200 hover:bg-[#F4F0FF] card-hover"
            style={{ color: '#9A7FD0', border: '1px solid rgba(28,58,42,0.15)' }}>
            <span>See Examples</span>
            <span className="text-gold-shimmer">→</span>
          </button>
        </div>
        
        <div className="animate-fadeInUp delay-400 flex items-center justify-center gap-8 mt-12">
          {[
            { icon: '🚀', text: 'Easy to use' },
            { icon: '💝', text: 'Made with love' },
            { icon: '🔒', text: 'Privacy first' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm" style={{ color: '#A0A0A0' }}>
              <span className="animate-bounceSoft" style={{ animationDelay: `${i * 0.2}s` }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Final CTA Section ─────────────────────────────────────────────────────────
function FinalCTASection({ onStart }: { onStart: () => void }) {
  return (
    <section className="py-40 px-6 text-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F4F0FF 0%, #F8F6F8 50%, #E8E2FF 100%)' }}>
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute w-96 h-96 rounded-full blur-3xl animate-pulseSoft" style={{ background: 'radial-gradient(circle, #DCD0FF, transparent 70%)', top: '-20%', left: '-10%' }} />
        <div className="absolute w-80 h-80 rounded-full blur-3xl animate-pulseSoft" style={{ background: 'radial-gradient(circle, #B8A5E0, transparent 70%)', bottom: '-20%', right: '-5%', animationDelay: '1.5s' }} />
      </div>
      <div className="relative max-w-3xl mx-auto">
        <div className="text-6xl mb-6 animate-fadeInUp">🪺</div>
        <h2 className="font-serif mb-4 animate-fadeInUp delay-100" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: '#9A7FD0', lineHeight: 1.05 }}>
          Your next memory<br />is waiting to be made
        </h2>
        <p className="text-base mb-10 max-w-md mx-auto animate-fadeInUp delay-200" style={{ color: '#A0A0A0', fontWeight: 300 }}>
          Free to start. No design skills needed. Just love, stories, and a little bit of magic.
        </p>
        <button
          onClick={onStart}
          className="btn-forest font-semibold px-10 py-4 rounded-full text-lg animate-fadeInUp delay-300"
        >
          <span>Start Creating — It's Free</span>
        </button>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="py-16 px-6" style={{ background: '#9A7FD0', borderTop: '1px solid rgba(201,168,76,0.1)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.2)' }}>
                <span>🪺</span>
              </div>
              <span className="font-serif text-xl font-semibold text-white">JoyNest</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(250,247,242,0.5)' }}>
              The world's most beautiful platform for preserving and sharing your most precious memories.
            </p>
          </div>
          {[
            { title: 'Product', links: ['Templates', 'Features', 'Pricing', 'Gallery', 'Changelog'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
            { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Security'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-sm mb-4" style={{ color: '#F8F6F8' }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm transition-colors duration-200 hover:text-[#DCD0FF]"
                      style={{ color: 'rgba(250,247,242,0.5)' }}>{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm" style={{ color: 'rgba(250,247,242,0.35)' }}>© 2026 JoyNest. Made with love and a little magic.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            {['Twitter', 'Instagram', 'Pinterest'].map(s => (
              <a key={s} href="#" className="text-sm transition-colors duration-200 hover:text-[#DCD0FF]"
                style={{ color: 'rgba(250,247,242,0.4)' }}>{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = () => {
    // Here you would integrate with your backend API
    console.log('Submit:', { mode, email, password, name })
    onSuccess()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(28,58,42,0.6)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden animate-scaleIn"
        style={{ boxShadow: '0 40px 100px rgba(28,58,42,0.3)', border: '1px solid rgba(201,168,76,0.2)' }}>
        <div className="grid md:grid-cols-2">
          {/* Left panel */}
          <div className="relative hidden md:flex flex-col items-center justify-center p-12 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #9A7FD0 0%, #B8A5E0 100%)' }}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute w-40 h-40 rounded-full blur-2xl" style={{ background: '#DCD0FF', top: '10%', right: '10%', animation: 'pulse-soft 4s ease-in-out infinite' }} />
              <div className="absolute w-32 h-32 rounded-full blur-2xl" style={{ background: '#B8A5E0', bottom: '20%', left: '5%', animation: 'pulse-soft 5s ease-in-out 1s infinite' }} />
            </div>

            {/* Floating polaroids in modal */}
            <div className="relative z-10 text-center">
              <div className="relative w-48 mx-auto mb-8">
                <div className="polaroid" style={{ transform: 'rotate(-6deg)', marginBottom: '-20px', position: 'relative', zIndex: 1 }}>
                  <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=160&fit=crop&auto=format" alt="Friends" className="w-full object-cover" style={{ height: 120 }} />
                  <p className="text-center text-xs mt-2" style={{ fontFamily: 'cursive', color: '#A0A0A0' }}>Forever friends 💛</p>
                </div>
                <div className="polaroid absolute top-4 left-4" style={{ transform: 'rotate(4deg)', zIndex: 2 }}>
                  <img src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=200&h=160&fit=crop&auto=format" alt="Wedding" className="w-full object-cover" style={{ height: 120 }} />
                  <p className="text-center text-xs mt-2" style={{ fontFamily: 'cursive', color: '#A0A0A0' }}>Just married ✨</p>
                </div>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-white mb-3">Every memory deserves to be beautiful</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(250,247,242,0.6)' }}>
                Join thousands of people preserving their most precious moments in ways that feel magical.
              </p>
              <p className="mt-6 text-xs italic" style={{ color: 'rgba(201,168,76,0.8)', fontFamily: 'var(--font-serif)' }}>
                "The best gift you can give someone is a memory they'll never forget."
              </p>
            </div>
          </div>

          {/* Right panel */}
          <div className="p-10 md:p-12 paper-texture" style={{ background: '#F8F6F8' }}>
            <button onClick={onClose} className="float-right w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-[#F4F0FF] text-lg" style={{ color: '#A0A0A0' }}>×</button>

            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl">🪺</span>
                <span className="font-serif text-xl font-semibold" style={{ color: '#9A7FD0' }}>JoyNest</span>
              </div>
              <h2 className="font-serif text-3xl font-semibold mb-1" style={{ color: '#9A7FD0' }}>
                {mode === 'login' ? 'Welcome back' : 'Start your story'}
              </h2>
              <p className="text-sm" style={{ color: '#A0A0A0' }}>
                {mode === 'login' ? 'Your memories are waiting.' : 'Create something unforgettable today.'}
              </p>
            </div>

            {/* Google button */}
            <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl mb-6 font-medium text-sm transition-all duration-200 hover:shadow-md"
              style={{ border: '1px solid rgba(28,58,42,0.15)', color: '#2A2A2A', background: 'white' }}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(28,58,42,0.1)' }} />
              <span className="text-xs" style={{ color: '#A0A0A0' }}>or continue with email</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(28,58,42,0.1)' }} />
            </div>

            <div className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#2A2A2A' }}>Your name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="input-elegant"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#2A2A2A' }}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-elegant"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#2A2A2A' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-elegant"
                />
                {mode === 'login' && (
                  <a href="#" className="block text-right text-xs mt-1.5 hover:text-[#DCD0FF] transition-colors" style={{ color: '#A0A0A0' }}>Forgot password?</a>
                )}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="btn-forest w-full font-semibold py-3.5 rounded-xl mt-6 text-sm"
            >
              <span>{mode === 'login' ? 'Sign in to JoyNest' : 'Create my account'}</span>
            </button>

            <p className="text-center text-sm mt-5" style={{ color: '#A0A0A0' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="font-semibold hover:text-[#DCD0FF] transition-colors underline decoration-2 underline-offset-2" style={{ color: '#9A7FD0' }}>
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
const projects = [
  { id: 1, title: "Mum's 60th Birthday", type: 'birthday', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=220&fit=crop&auto=format', views: 142, edited: '2 hours ago', status: 'published' },
  { id: 2, title: 'Our Paris Anniversary', type: 'romance', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=220&fit=crop&auto=format', views: 89, edited: 'Yesterday', status: 'published' },
  { id: 3, title: 'Sofia & Leo Wedding', type: 'wedding', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=220&fit=crop&auto=format', views: 0, edited: '3 days ago', status: 'draft' },
  { id: 4, title: 'Japan Trip 2024', type: 'travel', img: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&h=220&fit=crop&auto=format', views: 67, edited: 'Last week', status: 'published' },
]

function Dashboard({ onBack, onEditor }: { onBack: () => void; onEditor: () => void }) {
  const [activeTab, setActiveTab] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [showNewModal, setShowNewModal] = useState(false)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen flex" style={{ background: '#F8F6F8' }}>
      {/* Sidebar */}
      <aside className="w-64 hidden lg:flex flex-col fixed top-0 left-0 h-screen z-40"
        style={{ background: '#9A7FD0', borderRight: '1px solid rgba(201,168,76,0.1)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={onBack} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.2)' }}>
              <span>🪺</span>
            </div>
            <span className="font-serif text-lg font-semibold text-white">JoyNest</span>
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { icon: '⊞', label: 'Dashboard', active: true },
            { icon: '📁', label: 'My Projects', active: false },
            { icon: '🎨', label: 'Templates', active: false },
            { icon: '📊', label: 'Analytics', active: false },
            { icon: '👤', label: 'Profile', active: false },
            { icon: '⚙️', label: 'Settings', active: false },
          ].map(item => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: item.active ? 'rgba(201,168,76,0.15)' : 'transparent',
                color: item.active ? '#DCD0FF' : 'rgba(250,247,242,0.6)',
              }}
              onMouseEnter={e => !item.active && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)', e.currentTarget.style.color = 'rgba(250,247,242,0.9)')}
              onMouseLeave={e => !item.active && (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(250,247,242,0.6)')}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="rounded-xl p-4" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: '#DCD0FF' }}>Free Plan</p>
            <p className="text-xs mb-3" style={{ color: 'rgba(250,247,242,0.5)' }}>2 of 3 projects used</p>
            <div className="w-full h-1.5 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full" style={{ width: '66%', background: 'linear-gradient(90deg, #DCD0FF, #E8E2FF)' }} />
            </div>
            <button className="w-full text-xs font-semibold py-2 rounded-lg transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #DCD0FF, #E8E2FF)', color: '#9A7FD0' }}>
              Upgrade to Pro
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4 px-1">
            <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format" alt="Profile" className="w-8 h-8 rounded-full object-cover" style={{ border: '2px solid rgba(201,168,76,0.3)' }} />
            <div>
              <div className="text-sm font-medium" style={{ color: '#F8F6F8' }}>Alex Rivera</div>
              <div className="text-xs" style={{ color: 'rgba(250,247,242,0.4)' }}>alex@gmail.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 lg:px-10 py-4"
          style={{ background: 'rgba(250,247,242,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(28,58,42,0.06)' }}>
          <div>
            <h1 className="font-serif text-xl font-semibold" style={{ color: '#9A7FD0' }}>
              {greeting}, Alex. ✨
            </h1>
            <p className="text-xs" style={{ color: '#A0A0A0' }}>Continue creating memories</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A0A0A0' }}>🔍</span>
              <input
                placeholder="Search memories..."
                className="pl-9 pr-4 py-2 text-sm rounded-full outline-none"
                style={{ background: '#F4F0FF', border: '1px solid rgba(28,58,42,0.08)', color: '#2A2A2A', width: 200 }}
              />
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="btn-primary font-medium px-5 py-2.5 rounded-full text-sm flex items-center gap-2"
            >
              <span style={{ position: 'relative', zIndex: 1 }}>+</span>
              <span>New Memory</span>
            </button>
          </div>
        </header>

        <div className="px-6 lg:px-10 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total projects', val: '4', icon: '📁', color: '#F4F0FF' },
              { label: 'Total views', val: '298', icon: '👁', color: '#E8E2FF' },
              { label: 'Shared links', val: '3', icon: '🔗', color: '#F2EEF8' },
              { label: 'Photos stored', val: '127', icon: '🖼️', color: '#F4F0FF' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 card-hover" style={{ background: s.color, border: '1px solid rgba(28,58,42,0.05)' }}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-serif text-3xl font-semibold" style={{ color: '#9A7FD0' }}>{s.val}</div>
                <div className="text-xs mt-0.5" style={{ color: '#A0A0A0' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Projects heading + tabs */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl font-semibold" style={{ color: '#9A7FD0' }}>My Memories</h2>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#F4F0FF' }}>
              {['all', 'published', 'draft'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200"
                  style={{
                    background: activeTab === tab ? '#9A7FD0' : 'transparent',
                    color: activeTab === tab ? '#F8F6F8' : '#A0A0A0',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Project grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
            {projects
              .filter(p => activeTab === 'all' || p.status === activeTab)
              .map(p => (
              <div
                key={p.id}
                className="rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: '#F8F6F8',
                  border: '1px solid rgba(28,58,42,0.07)',
                  boxShadow: hoveredCard === p.id ? '0 20px 50px rgba(28,58,42,0.1)' : '0 2px 12px rgba(28,58,42,0.04)',
                  transform: hoveredCard === p.id ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.4s cubic-bezier(0.22,1,0.36,1)',
                }}
                onMouseEnter={() => setHoveredCard(p.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="relative overflow-hidden" style={{ height: 180 }}>
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-700"
                    style={{ transform: hoveredCard === p.id ? 'scale(1.05)' : 'scale(1)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                      style={{
                        background: p.status === 'published' ? 'rgba(28,58,42,0.85)' : 'rgba(201,168,76,0.85)',
                        color: p.status === 'published' ? '#DCD0FF' : '#9A7FD0',
                      }}>
                      {p.status === 'published' ? '● Live' : '○ Draft'}
                    </span>
                  </div>

                  {/* Action buttons on hover */}
                  <div className="absolute top-3 right-3 flex gap-2 transition-all duration-300"
                    style={{ opacity: hoveredCard === p.id ? 1 : 0, transform: hoveredCard === p.id ? 'translateY(0)' : 'translateY(-4px)' }}>
                    <button
                      onClick={onEditor}
                      className="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                      style={{ background: 'rgba(250,247,242,0.95)', color: '#9A7FD0' }}>
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        // For now, show a message - can be replaced with share modal
                        alert('Share functionality coming soon! For now, publish your project to get a shareable link.');
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200"
                      style={{ background: 'rgba(201,168,76,0.9)', color: '#9A7FD0' }}>
                      Share
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-semibold text-base" style={{ color: '#9A7FD0' }}>{p.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs capitalize" style={{ color: '#A0A0A0' }}>{p.type}</span>
                        <span className="text-xs" style={{ color: '#E0D8F0' }}>·</span>
                        <span className="text-xs" style={{ color: '#A0A0A0' }}>Edited {p.edited}</span>
                      </div>
                    </div>
                    {p.views > 0 && (
                      <div className="text-right shrink-0">
                        <div className="font-serif text-lg font-semibold" style={{ color: '#9A7FD0' }}>{p.views}</div>
                        <div className="text-xs" style={{ color: '#A0A0A0' }}>views</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* New project card */}
            <button
              onClick={() => setShowNewModal(true)}
              className="rounded-2xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-300 group"
              style={{
                border: '2px dashed rgba(28,58,42,0.15)',
                background: 'transparent',
                minHeight: 280,
                color: '#A0A0A0',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#DCD0FF'; e.currentTarget.style.background = 'rgba(201,168,76,0.04)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(28,58,42,0.15)'; e.currentTarget.style.background = 'transparent' }}
            >
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: '#F4F0FF' }}>+</div>
              <div className="text-center">
                <p className="font-serif font-semibold text-base mb-1" style={{ color: '#9A7FD0' }}>New Memory</p>
                <p className="text-sm" style={{ color: '#A0A0A0' }}>Start a new beautiful memory site</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* New Project Modal */}
      {showNewModal && (
        <NewProjectModal onClose={() => setShowNewModal(false)} onCreate={onEditor} />
      )}
    </div>
  )
}

// ─── New Project Modal ────────────────────────────────────────────────────────
function NewProjectModal({ onClose, onCreate }: { onClose: () => void; onCreate: () => void }) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState(0)

  const steps = ['Template', 'Details', 'Theme']
  const templateOptions = templates.slice(0, 4)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(28,58,42,0.5)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden animate-scaleIn"
        style={{ background: '#F8F6F8', boxShadow: '0 40px 100px rgba(28,58,42,0.25)', border: '1px solid rgba(201,168,76,0.15)' }}>
        <div className="p-8">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-semibold" style={{ color: '#9A7FD0' }}>New Memory</h2>
            <div className="flex items-center gap-2">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
                      style={{
                        background: i + 1 <= step ? '#9A7FD0' : '#F4F0FF',
                        color: i + 1 <= step ? '#F8F6F8' : '#A0A0A0',
                      }}>
                      {i + 1 < step ? '✓' : i + 1}
                    </div>
                    <span className="text-xs mt-1 hidden sm:block" style={{ color: i + 1 === step ? '#9A7FD0' : '#A0A0A0' }}>{s}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-8 h-px mb-4" style={{ background: i + 1 < step ? '#DCD0FF' : 'rgba(28,58,42,0.1)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {step === 1 && (
            <div>
              <p className="text-sm mb-5" style={{ color: '#A0A0A0' }}>Choose a template to get started</p>
              <div className="grid grid-cols-2 gap-3">
                {templateOptions.map((t, i) => (
                  <button
                    key={t.name}
                    onClick={() => setSelected(i)}
                    className="rounded-xl overflow-hidden text-left transition-all duration-200"
                    style={{
                      border: selected === i ? '2px solid #DCD0FF' : '2px solid rgba(28,58,42,0.08)',
                      transform: selected === i ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: selected === i ? '0 8px 24px rgba(201,168,76,0.2)' : 'none',
                    }}
                  >
                    <img src={t.img} alt={t.name} className="w-full object-cover" style={{ height: 90 }} />
                    <div className="px-3 py-2.5">
                      <div className="text-sm font-medium" style={{ color: '#9A7FD0' }}>{t.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm mb-5" style={{ color: '#A0A0A0' }}>Give your memory a name</p>
              {[
                { label: 'Project name', placeholder: "e.g. Mum's 60th Birthday" },
                { label: 'For whom?', placeholder: 'e.g. Mum, Sarah, our family' },
                { label: 'Occasion', placeholder: 'e.g. Birthday, Wedding, Travel...' },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#2A2A2A' }}>{f.label}</label>
                  <input
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{ background: 'white', border: '1.5px solid rgba(28,58,42,0.12)', color: '#2A2A2A' }}
                    onFocus={e => e.target.style.borderColor = '#DCD0FF'}
                    onBlur={e => e.target.style.borderColor = 'rgba(28,58,42,0.12)'}
                  />
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm mb-5" style={{ color: '#A0A0A0' }}>Choose your aesthetic</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'Warm & Cozy', colors: ['#F4F0FF', '#DCD0FF', '#9A7FD0'] },
                  { name: 'Romantic Rose', colors: ['#F2EEF8', '#B8A5E0', '#2A2A2A'] },
                  { name: 'Garden Fresh', colors: ['#E8E2FF', '#B8A5E0', '#DCD0FF'] },
                  { name: 'Midnight Blue', colors: ['#0F1923', '#4A90D9', '#F8F6F8'] },
                  { name: 'Lavender Dream', colors: ['#F0ECF7', '#9B7BB8', '#2A2A2A'] },
                  { name: 'Pure Minimal', colors: ['#FFFFFF', '#2A2A2A', '#E5E5E5'] },
                ].map((theme, i) => (
                  <button
                    key={theme.name}
                    onClick={() => setSelected(i)}
                    className="rounded-xl overflow-hidden transition-all duration-200 text-left"
                    style={{
                      border: selected === i ? '2px solid #DCD0FF' : '2px solid rgba(28,58,42,0.08)',
                    }}
                  >
                    <div className="flex h-10">
                      {theme.colors.map(c => (
                        <div key={c} className="flex-1" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="px-2.5 py-2">
                      <span className="text-xs font-medium" style={{ color: '#9A7FD0' }}>{theme.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{ border: '1px solid rgba(28,58,42,0.15)', color: '#2A2A2A' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F4F0FF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Back
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(s => s + 1) : onCreate()}
              className="btn-primary flex-1 py-3 rounded-xl text-sm font-semibold"
            >
              <span>{step < 3 ? 'Continue →' : '✨ Create Memory'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Editor View ──────────────────────────────────────────────────────────────
function EditorView({ onBack, onPublish }: { onBack: () => void; onPublish: () => void }) {
  const [activeSection, setActiveSection] = useState('gallery')
  const [playing, setPlaying] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const sections = [
    { id: 'gallery', icon: '🖼️', label: 'Gallery' },
    { id: 'journal', icon: '📖', label: 'Journal' },
    { id: 'letter', icon: '✉️', label: 'Letter' },
    { id: 'audio', icon: '🎵', label: 'Music' },
    { id: 'timeline', icon: '⏳', label: 'Timeline' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
  ]

  const galleryImages = [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=250&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=180&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=300&h=200&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&h=220&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&h=180&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=300&h=240&fit=crop&auto=format',
  ]

  return (
    <div className="flex flex-col h-screen" style={{ background: '#9A7FD0' }}>
      {/* Editor toolbar */}
      <header className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: '#162E20', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg transition-colors text-sm" style={{ color: 'rgba(250,247,242,0.6)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            ← Back
          </button>
          <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <h1 className="font-serif text-base font-semibold text-white">Mum's 60th Birthday</h1>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.2)', color: '#DCD0FF' }}>Draft</span>
        </div>

        <div className="flex items-center gap-2">
          {[['↩', 'Undo'], ['↪', 'Redo']].map(([icon, label]) => (
            <button key={label} title={label} className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
              style={{ color: 'rgba(250,247,242,0.6)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {icon}
            </button>
          ))}
          <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <button className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{ color: 'rgba(250,247,242,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            Preview
          </button>
          <button className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{ background: 'rgba(201,168,76,0.15)', color: '#DCD0FF', border: '1px solid rgba(201,168,76,0.25)' }}>
            Save
          </button>
          <button
            onClick={onPublish}
            className="btn-gold px-5 py-1.5 rounded-lg text-xs font-semibold"
          >
            Publish ✨
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <aside className="w-56 shrink-0 flex flex-col" style={{ background: '#162E20', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-3 space-y-0.5 flex-1 overflow-y-auto">
            <p className="text-xs font-medium px-3 py-2 uppercase tracking-wider" style={{ color: 'rgba(250,247,242,0.3)' }}>Sections</p>
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: activeSection === s.id ? 'rgba(201,168,76,0.15)' : 'transparent',
                  color: activeSection === s.id ? '#DCD0FF' : 'rgba(250,247,242,0.6)',
                }}
                onMouseEnter={e => activeSection !== s.id && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)', e.currentTarget.style.color = 'rgba(250,247,242,0.9)')}
                onMouseLeave={e => activeSection !== s.id && (e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(250,247,242,0.6)')}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Center preview */}
        <main className="flex-1 overflow-y-auto p-6 flex items-start justify-center" style={{ background: '#0F2318' }}>
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{ background: '#F8F6F8', boxShadow: '0 20px 80px rgba(0,0,0,0.5)', minHeight: 600 }}>
            {/* Page header */}
            <div className="relative overflow-hidden" style={{ height: 200, background: 'linear-gradient(135deg, #9A7FD0, #B8A5E0)' }}>
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop&auto=format" alt="Cover" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="font-serif text-4xl font-bold text-white mb-1" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>Happy 60th!</h2>
                  <p className="text-sm font-light" style={{ color: 'rgba(250,247,242,0.8)' }}>For the most wonderful Mum in the world</p>
                </div>
              </div>
            </div>

            {/* Content area */}
            <div className="p-6">
              {activeSection === 'gallery' && (
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-4" style={{ color: '#9A7FD0' }}>Memories Gallery</h3>
                  <div className="columns-3 gap-3">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="mb-3 rounded-xl overflow-hidden group cursor-pointer card-hover">
                        <img src={img} alt={`Memory ${i+1}`} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-200"
                    style={{ borderColor: 'rgba(28,58,42,0.15)', color: '#A0A0A0' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#DCD0FF'; e.currentTarget.style.background = 'rgba(201,168,76,0.04)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(28,58,42,0.15)'; e.currentTarget.style.background = 'transparent' }}>
                    <div className="text-2xl mb-1">📸</div>
                    <p className="text-sm">Drop photos here or click to upload</p>
                  </div>
                </div>
              )}

              {activeSection === 'journal' && (
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-4" style={{ color: '#9A7FD0' }}>Journal Pages</h3>
                  <div className="relative" style={{ minHeight: 300 }}>
                    <div className="rounded-xl p-6 paper-texture"
                      style={{ background: '#FFFEF8', border: '1px solid rgba(28,58,42,0.08)', boxShadow: '2px 4px 20px rgba(0,0,0,0.06)', lineHeight: '2rem',
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(28,58,42,0.06) 31px, rgba(28,58,42,0.06) 32px)' }}>
                      <div className="absolute top-4 right-4">
                        <div className="tape text-xs px-3 py-1 rounded font-medium" style={{ color: '#A0A0A0' }}>Page 1</div>
                      </div>
                      <p className="font-serif text-base leading-8" style={{ color: '#2A2A2A', fontStyle: 'italic' }}>
                        Sixty years of love, laughter, and the most beautiful heart I know. Every single memory I have has you in it — making it brighter, warmer, and full of joy.
                      </p>
                      <p className="font-serif text-base leading-8 mt-4" style={{ color: '#2A2A2A', fontStyle: 'italic' }}>
                        Thank you for being my anchor, my north star, and my best friend. Here's to sixty more...
                      </p>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="btn-primary text-xs font-medium px-4 py-2 rounded-lg"><span>+ Add Page</span></button>
                      <div className="flex gap-1 ml-auto items-center">
                        <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
                          style={{ background: '#F4F0FF', color: '#9A7FD0' }}>←</button>
                        <span className="text-xs px-3" style={{ color: '#A0A0A0' }}>1 / 3</span>
                        <button onClick={() => setCurrentPage(Math.min(2, currentPage + 1))} className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors"
                          style={{ background: '#F4F0FF', color: '#9A7FD0' }}>→</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'letter' && (
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-4" style={{ color: '#9A7FD0' }}>Personal Letter</h3>
                  <div className="rounded-2xl overflow-hidden" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.1)' }}>
                    <div className="h-3" style={{ background: 'linear-gradient(90deg, #B8A5E0, #DCD0FF, #D8D0E8)' }} />
                    <div className="p-8 paper-texture" style={{ background: '#FFFEF8' }}>
                      <div className="text-right text-xs mb-6" style={{ color: '#A0A0A0', fontFamily: 'cursive' }}>London, 14th June 2025</div>
                      <p className="font-serif text-lg mb-4" style={{ color: '#9A7FD0', fontStyle: 'italic' }}>Dearest Mum,</p>
                      <p className="text-sm leading-relaxed mb-4" style={{ color: '#2A2A2A', fontFamily: 'var(--font-serif)' }}>
                        Where do I even begin? You have been the greatest gift of my life. Every moment I have laughed, every tear you have dried, every warm embrace at the door — it is all you.
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: '#2A2A2A', fontFamily: 'var(--font-serif)' }}>
                        Happy 60th birthday to the most extraordinary woman I know.
                      </p>
                      <p className="font-serif text-base mt-6" style={{ color: '#9A7FD0', fontStyle: 'italic' }}>All my love, always — your daughter, Elena ♥</p>
                      <div className="mt-6 flex justify-end">
                        <div className="animate-wax-seal w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ background: 'linear-gradient(135deg, #B8A5E0, #9A4F5A)', boxShadow: '0 4px 12px rgba(183,110,121,0.4)' }}>
                          ♥
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'audio' && (
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-4" style={{ color: '#9A7FD0' }}>Music & Audio</h3>
                  {/* Vinyl player */}
                  <div className="flex items-center gap-6 p-6 rounded-2xl mb-6"
                    style={{ background: '#9A7FD0' }}>
                    <div className="w-20 h-20 rounded-full shrink-0 vinyl-groove flex items-center justify-center"
                      style={{
                        background: 'radial-gradient(circle at center, #111 0%, #222 30%, #111 32%, #2A2A2A 40%, #1A1A1A 100%)',
                        animation: playing ? 'spin-slow 4s linear infinite' : 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                      }}>
                      <div className="w-6 h-6 rounded-full" style={{ background: 'radial-gradient(circle, #444, #222)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-base font-semibold text-white truncate">La Vie en Rose</p>
                      <p className="text-xs mb-3" style={{ color: 'rgba(250,247,242,0.5)' }}>Édith Piaf · 3:04</p>
                      <div className="w-full h-1.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full" style={{ width: '35%', background: 'linear-gradient(90deg, #DCD0FF, #E8E2FF)' }} />
                      </div>
                      <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(250,247,242,0.4)' }}>
                        <span>1:04</span><span>3:04</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setPlaying(!playing)}
                      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-all duration-200"
                      style={{ background: 'linear-gradient(135deg, #DCD0FF, #E8E2FF)', color: '#9A7FD0' }}
                    >
                      {playing ? '⏸' : '▶'}
                    </button>
                  </div>

                  {/* Wave animation */}
                  <div className="flex items-center gap-1 justify-center h-10 mb-4">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div key={i} className="w-1.5 rounded-full"
                        style={{
                          background: playing ? '#DCD0FF' : '#E0D8F0',
                          height: `${10 + Math.sin(i * 0.8) * 20 + 10}px`,
                          opacity: playing ? 0.8 : 0.4,
                          transition: 'all 0.3s ease',
                          animation: playing ? `pulse-soft ${0.5 + (i % 3) * 0.2}s ease-in-out infinite` : 'none',
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {(activeSection === 'timeline' || activeSection === 'settings') && (
                <div className="py-8 text-center">
                  <div className="text-5xl mb-4">{activeSection === 'timeline' ? '⏳' : '⚙️'}</div>
                  <h3 className="font-serif text-xl font-semibold mb-2" style={{ color: '#9A7FD0' }}>
                    {activeSection === 'timeline' ? 'Memory Timeline' : 'Page Settings'}
                  </h3>
                  <p className="text-sm" style={{ color: '#A0A0A0' }}>
                    {activeSection === 'timeline' ? 'Add key moments to create a beautiful chronological story.' : 'Customize fonts, colors, and visibility settings.'}
                  </p>
                  <button className="btn-primary mt-6 px-6 py-2.5 rounded-xl text-sm font-medium">
                    <span>{activeSection === 'timeline' ? '+ Add moment' : 'Open settings'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right sidebar */}
        <aside className="w-52 shrink-0 flex flex-col overflow-y-auto" style={{ background: '#162E20', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="p-4 space-y-4">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(250,247,242,0.3)' }}>Properties</p>

            {[
              { label: 'Background', type: 'color', val: '#F8F6F8' },
              { label: 'Accent', type: 'color', val: '#DCD0FF' },
            ].map(prop => (
              <div key={prop.label}>
                <label className="block text-xs mb-1.5" style={{ color: 'rgba(250,247,242,0.5)' }}>{prop.label}</label>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg border" style={{ background: prop.val, borderColor: 'rgba(255,255,255,0.15)' }} />
                  <span className="text-xs font-mono" style={{ color: 'rgba(250,247,242,0.6)' }}>{prop.val}</span>
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(250,247,242,0.5)' }}>Font</label>
              <div className="px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(250,247,242,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Playfair Display
              </div>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'rgba(250,247,242,0.5)' }}>Animation</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['Fade', 'Float', 'Slide', 'Flip'].map(a => (
                  <button key={a} className="text-xs py-1.5 rounded-lg transition-colors"
                    style={{ background: a === 'Fade' ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
                      color: a === 'Fade' ? '#DCD0FF' : 'rgba(250,247,242,0.5)',
                      border: `1px solid ${a === 'Fade' ? 'rgba(201,168,76,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs mb-2" style={{ color: 'rgba(250,247,242,0.5)' }}>Visibility</label>
              {['Public', 'Private', 'Invite only'].map(v => (
                <label key={v} className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: v === 'Public' ? '#DCD0FF' : 'rgba(255,255,255,0.2)' }}>
                    {v === 'Public' && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#DCD0FF' }} />}
                  </div>
                  <span className="text-xs" style={{ color: v === 'Public' ? 'rgba(250,247,242,0.9)' : 'rgba(250,247,242,0.45)' }}>{v}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// ─── Publish View ─────────────────────────────────────────────────────────────
function PublishView({ onBack }: { onBack: () => void }) {
  const [copied, setCopied] = useState(false)
  const link = 'joynest.co/m/mums-60th-birthday'
  const confettiItems = Array.from({ length: 30 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    color: ['#DCD0FF', '#B8A5E0', '#D8D0E8', '#B8A5E0', '#F2C4A0'][i % 5],
    delay: `${Math.random() * 2}s`,
    size: `${6 + Math.random() * 8}px`,
    dur: `${2 + Math.random() * 2}s`,
  }))

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F8F6F8 0%, #F4F0FF 50%, #E8E2FF 100%)' }}>

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiItems.map((c, i) => (
          <div key={i} className="absolute rounded-sm"
            style={{
              left: c.left,
              top: '-20px',
              width: c.size,
              height: c.size,
              background: c.color,
              animation: `particleFloat ${c.dur} ease-in-out ${c.delay} infinite`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg text-center animate-scaleIn">
        <div className="text-7xl mb-6 animate-float">🎉</div>
        <h1 className="font-serif text-4xl font-semibold mb-3" style={{ color: '#9A7FD0' }}>
          Your memory is live!
        </h1>
        <p className="text-base mb-8" style={{ color: '#A0A0A0', fontWeight: 300 }}>
          Share this beautiful link with the people who matter most.
        </p>

        {/* Link box */}
        <div className="flex items-center gap-2 p-2 rounded-2xl mb-4"
          style={{ background: 'white', border: '1.5px solid rgba(201,168,76,0.3)', boxShadow: '0 8px 30px rgba(28,58,42,0.08)' }}>
          <div className="flex-1 px-3 py-2 text-sm font-medium text-left truncate" style={{ color: '#9A7FD0' }}>
            🔗 {link}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
            style={{
              background: copied ? '#B8A5E0' : 'linear-gradient(135deg, #9A7FD0, #B8A5E0)',
              color: copied ? '#DCD0FF' : '#F8F6F8',
            }}
          >
            {copied ? '✓ Copied!' : 'Copy link'}
          </button>
        </div>

        {/* QR Code placeholder */}
        <div className="flex justify-center mb-8">
          <div className="p-4 rounded-2xl bg-white" style={{ boxShadow: '0 4px 20px rgba(28,58,42,0.08)' }}>
            <div className="w-24 h-24 rounded-xl overflow-hidden" style={{ background: '#9A7FD0' }}>
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full p-2">
                <rect x="2" y="2" width="8" height="8" rx="1" fill="#DCD0FF" />
                <rect x="4" y="4" width="4" height="4" rx="0.5" fill="#9A7FD0" />
                <rect x="14" y="2" width="8" height="8" rx="1" fill="#DCD0FF" />
                <rect x="16" y="4" width="4" height="4" rx="0.5" fill="#9A7FD0" />
                <rect x="2" y="14" width="8" height="8" rx="1" fill="#DCD0FF" />
                <rect x="4" y="16" width="4" height="4" rx="0.5" fill="#9A7FD0" />
                <rect x="14" y="14" width="3" height="3" rx="0.5" fill="#DCD0FF" />
                <rect x="19" y="14" width="3" height="3" rx="0.5" fill="#DCD0FF" />
                <rect x="14" y="19" width="3" height="3" rx="0.5" fill="#DCD0FF" />
                <rect x="19" y="19" width="3" height="3" rx="0.5" fill="#DCD0FF" />
              </svg>
            </div>
            <p className="text-xs text-center mt-2" style={{ color: '#A0A0A0' }}>Scan to open</p>
          </div>
        </div>

        {/* Share buttons */}
        <div className="flex gap-3 justify-center mb-8">
          {['📱 WhatsApp', '📘 Facebook', '🐦 Twitter', '📧 Email'].map(s => (
            <button 
              key={s} 
              onClick={() => {
                // For now, show a message - can be replaced with actual share functionality
                alert(`${s} sharing coming soon! For now, copy the link below to share.`);
              }}
              className="text-xs font-medium px-4 py-2.5 rounded-xl transition-all duration-200"
              style={{ background: 'white', border: '1px solid rgba(28,58,42,0.1)', color: '#2A2A2A' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F4F0FF'; e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(28,58,42,0.1)' }}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ border: '1px solid rgba(28,58,42,0.15)', color: '#9A7FD0' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F4F0FF'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Back to Dashboard
          </button>
          <button 
            onClick={() => {
              // For now, show a message - this would be the live published page
              alert('Live page functionality coming soon! Your project will be viewable at a unique URL after publishing.');
            }}
            className="btn-forest px-6 py-3 rounded-xl text-sm font-semibold"
            style={{ opacity: 0.7 }}
          >
            <span>View live page →</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
function LandingPage({ onStart, onAuth }: { onStart: () => void; onAuth: () => void }) {
  return (
    <div style={{ background: '#F8F6F8' }}>
      <HeroSection onStart={onAuth} />
      <FeaturesSection />
      <TemplatesSection onStart={onAuth} onAuth={() => setShowAuth(true)} />
      <TestimonialsSection />
      <FinalCTASection onStart={onAuth} />
      <Footer />
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState<View>('landing')
  const [showAuth, setShowAuth] = useState(false)

  const goToDash = () => { setShowAuth(false); setView('dashboard') }

  return (
    <>
      {view !== 'editor' && view !== 'publish' && (
        <Navbar
          onAuth={() => setShowAuth(true)}
          onDash={() => setView('dashboard')}
          view={view}
        />
      )}

      {view === 'landing' && (
        <LandingPage
          onStart={goToDash}
          onAuth={() => setShowAuth(true)}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard
          onBack={() => setView('landing')}
          onEditor={() => setView('editor')}
        />
      )}

      {view === 'editor' && (
        <EditorView
          onBack={() => setView('dashboard')}
          onPublish={() => setView('publish')}
        />
      )}

      {view === 'publish' && (
        <PublishView onBack={() => setView('dashboard')} />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={goToDash}
        />
      )}
    </>
  )
}
