import { Link, NavLink } from 'react-router-dom'
import { Feather, ArrowUpRight, Menu, X, ArrowRight, Heart, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return <header className="site-header">
    <div className="nav-wrap">
      <Link to="/" className="brand" onClick={close}><span className="brand-mark"><Feather size={18}/></span><span>after the draft<span className="brand-dot">.</span></span></Link>
      <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
      <nav className={open ? 'nav-links open' : 'nav-links'}>
        <NavLink to="/explore" onClick={close}>Explore letters</NavLink>
        <NavLink to="/about" onClick={close}>Our story</NavLink>
        <Link to="/write" className="nav-cta" onClick={close}>Write a letter <ArrowUpRight size={15}/></Link>
      </nav>
    </div>
  </header>
}
export function Footer() {
  return <footer className="footer">
    <div className="footer-top"><Link to="/" className="brand"><span className="brand-mark"><Feather size={17}/></span><span>after the draft<span className="brand-dot">.</span></span></Link><p>Some words deserve a place,<br/>even if they never get sent.</p></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} After the Draft</span><div><Link to="/explore">Explore</Link><Link to="/write">Write</Link><Link to="/guidelines">Guidelines</Link><Link to="/privacy">Privacy</Link></div><span className="footer-note">Made for the words we keep.</span></div>
  </footer>
}
export function Eyebrow({children}) { return <div className="eyebrow"><span/> {children}</div> }
export function SectionHeading({kicker,title,copy}) { return <div className="section-heading"><Eyebrow>{kicker}</Eyebrow><h2>{title}</h2>{copy && <p>{copy}</p>}</div> }
export function LetterCard({letter,index=0}) {
  return <Link to={`/letter/${letter.id}`} className={`letter-card card-tone-${index%3}`}>
    <div className="letter-card-top"><span className="emotion-tag">{letter.emotion_label || letter.emotion}</span><span className="card-index">NO. {String(index+1).padStart(2,'0')}</span></div>
    <h3>{letter.title}</h3><p className="letter-excerpt">{letter.body}</p>
    <div className="letter-card-bottom"><span>{letter.published_at ? new Date(letter.published_at).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'}) : 'A little while ago'}</span><span className="read-link">Read letter <ArrowUpRight size={15}/></span></div>
  </Link>
}
export function LoadingCards() { return <div className="letter-grid">{[1,2,3].map(n=><div className="skeleton" key={n}/>)}</div> }
export function EmptyState({title='Nothing here just yet.',copy='The next words might be yours.'}) { return <div className="empty-state"><Sparkles/><h3>{title}</h3><p>{copy}</p><Link className="text-link" to="/write">Leave the first letter <ArrowRight size={16}/></Link></div> }
export function Appreciation({count=0,active=false,onClick}) { return <button className={`appreciate ${active?'active':''}`} onClick={onClick}><Heart size={17} fill={active?'currentColor':'none'}/><span>I needed to read this</span><b>{count}</b></button> }
