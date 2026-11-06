import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Feather, Shuffle, Search, Heart, Send, BookOpen, Sparkles, Flag, Check, ChevronLeft, Quote, Menu, X } from 'lucide-react'
import { Header, Footer, Eyebrow, SectionHeading, LetterCard, LoadingCards, EmptyState, Appreciation } from './components'
import { emotions, recipientOptions } from './data'
import { getLetters, getFeatured, getLetter, getRandom, submitLetter, appreciate, reportLetter } from './api'

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({top:0,behavior:'instant'}) }, [pathname])
  return null
}
function Home() {
  const [featured,setFeatured] = useState([])
  useEffect(()=>{getFeatured().then(r=>setFeatured(r.data)).catch(()=>setFeatured([]))},[])
  return <main>
    <section className="hero shell">
      <div className="hero-copy">
        <Eyebrow>A place for the unexpressed</Eyebrow>
        <h1>Some words were <em>never meant</em> to be sent.</h1>
        <p className="hero-description">But perhaps they deserve to be written somewhere. A quiet corner for the things you never said, and the feelings you still carry.</p>
        <div className="hero-actions"><Link to="/write" className="button button-dark">Write your letter <ArrowUpRight size={17}/></Link><Link to="/explore" className="quiet-link">Read what others left behind <ArrowRight size={17}/></Link></div>
        <div className="hero-whisper"><span/> No identities. No expectations. No replies required.</div>
      </div>
      <div className="hero-art" aria-label="A handwritten letter illustration">
        <div className="paper-shadow"></div><div className="paper-back"></div>
        <div className="paper-sheet"><span className="paper-label">A letter, left here</span><div className="paper-rule"/><p>To the words<br/>I never found<br/>the courage to<br/>say,</p><p className="paper-script">you can rest here.</p><span className="paper-sign">— someone, somewhere</span></div>
        <span className="sparkle sparkle-one">✳</span><span className="sparkle sparkle-two">✳</span><span className="art-caption">A softer place for unfinished sentences.</span>
      </div>
      <div className="scroll-hint">Scroll to feel <span>↓</span></div>
    </section>
    <section className="manifesto section-pad"><div className="manifesto-inner"><span className="manifesto-mark">“</span><p>Not everything needs an audience.<br/><em>Sometimes it just needs a place.</em></p><span className="manifesto-caption">A small thought behind this space</span></div></section>
    <section className="emotion-section section-pad shell">
      <SectionHeading kicker="Find the feeling" title="What are you carrying?" copy="Every feeling deserves a little room. Begin wherever your heart happens to be."/>
      <div className="emotion-grid">{emotions.map((e,i)=><Link to={`/explore?emotion=${e.value}`} className={`emotion-item emotion-${e.value}`} key={e.value}><span className="emotion-number">{e.symbol}</span><h3>{e.label}</h3><p>{e.line}</p><ArrowUpRight size={17}/></Link>)}</div>
    </section>
    <section className="featured-section section-pad"><div className="shell"><div className="section-row"><SectionHeading kicker="Left here by someone" title="A few words to sit with" copy="Anonymous letters, shared with care. Take what you need; leave the rest."/><Link to="/explore" className="text-link desktop-link">Explore all letters <ArrowRight size={16}/></Link></div>
      {featured.length ? <div className="letter-grid">{featured.slice(0,3).map((l,i)=><LetterCard key={l.id} letter={l} index={i}/>)}</div> : <div className="quiet-note">The first letters are finding their way here. <Link to="/write">Leave one?</Link></div>}
      <Link to="/explore" className="text-link mobile-link">Explore all letters <ArrowRight size={16}/></Link></div></section>
    <section className="random-band section-pad shell"><div className="random-icon"><Shuffle/></div><div><Eyebrow>A little serendipity</Eyebrow><h2>Perhaps you needed<br/><em>to read this today.</em></h2></div><Link to="/random" className="button button-outline">Find me a letter <ArrowUpRight size={16}/></Link></section>
    <section className="closing-cta section-pad"><div className="closing-inner"><span className="closing-flower">✳</span><Eyebrow>Whenever you're ready</Eyebrow><h2>Somewhere, your words<br/><em>can rest.</em></h2><Link to="/write" className="button button-light">Leave a letter <ArrowUpRight size={16}/></Link><p>No names. No replies. Just a little room to be honest.</p></div></section>
  </main>
}
function Explore() {
  const location=useLocation(), params=new URLSearchParams(location.search)
  const [emotion,setEmotion]=useState(params.get('emotion')||'')
  const [search,setSearch]=useState('')
  const [letters,setLetters]=useState([])
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  useEffect(()=>{setLoading(true);setError('');getLetters({emotion:emotion||undefined,search:search||undefined}).then(r=>setLetters(r.data.results||r.data)).catch(()=>setError('We could not reach the archive. Is the Django server running?')).finally(()=>setLoading(false))},[emotion,search])
  return <main className="page-shell"><section className="page-intro shell"><Eyebrow>The open archive</Eyebrow><h1>Letters left <em>here.</em></h1><p>A collection of things people needed to put somewhere. Read gently.</p></section>
    <section className="shell archive-section"><div className="archive-tools"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search words, feelings, moments..."/></div><select value={emotion} onChange={e=>setEmotion(e.target.value)}><option value="">All feelings</option>{emotions.map(e=><option value={e.value} key={e.value}>{e.label}</option>)}</select></div>
      <div className="filter-pills"><button className={!emotion?'selected':''} onClick={()=>setEmotion('')}>All letters</button>{emotions.map(e=><button key={e.value} className={emotion===e.value?'selected':''} onClick={()=>setEmotion(e.value)}>{e.label}</button>)}</div>
      {loading?<LoadingCards/>:error?<div className="error-state">{error}<button onClick={()=>setEmotion(emotion)}>Try again</button></div>:letters.length?<div className="letter-grid">{letters.map((l,i)=><LetterCard key={l.id} letter={l} index={i}/>)}</div>:<EmptyState title="No letters found." copy="Try another feeling or leave the first words in this corner."/>}
    </section></main>
}
function Write() {
  const [form,setForm]=useState({title:'',body:'',emotion:'love',recipient_category:'',consent:false})
  const [preview,setPreview]=useState(false),[sending,setSending]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('')
  const update=(k,v)=>setForm(f=>({...f,[k]:v}))
  const send=async()=>{setSending(true);setError('');try{await submitLetter(form);setDone(true)}catch(e){setError(e.response?.data ? Object.values(e.response.data).flat().join(' ') : 'Could not submit. Please check that the backend is running and try again.')}finally{setSending(false)}}
  if(done)return <main className="success-page"><div className="success-card"><div className="success-icon"><Check/></div><Eyebrow>Safely received</Eyebrow><h1>Your words have<br/><em>found a place.</em></h1><p>Your letter is now waiting for a quiet human review. It will only appear in the archive if approved.</p><Link to="/explore" className="button button-dark">Return to the archive <ArrowRight size={16}/></Link><Link to="/" className="subtle-back">Back home</Link></div></main>
  return <main className="write-page shell"><div className="write-heading"><Eyebrow>A page of your own</Eyebrow><h1>Write what you <em>couldn't say.</em></h1><p>There is no perfect way to begin. Take your time. This space is yours for a moment.</p></div>
    <div className="write-layout"><div className="write-form">
      {!preview?<><label className="field-label">Give your letter a title <span>Required</span><input maxLength="100" value={form.title} onChange={e=>update('title',e.target.value)} placeholder="A sentence you never said..." /></label>
        <label className="field-label">Your words <span>{form.body.length}/5000</span><textarea maxLength="5000" rows="12" value={form.body} onChange={e=>update('body',e.target.value)} placeholder="Dear...&#10;&#10;You don't have to make it beautiful. Just make it honest."/></label>
        <div className="field-row"><label className="field-label">What does it feel like?<select value={form.emotion} onChange={e=>update('emotion',e.target.value)}>{emotions.map(e=><option value={e.value} key={e.value}>{e.label}</option>)}</select></label><label className="field-label">Who is it for? <span>Optional</span><select value={form.recipient_category} onChange={e=>update('recipient_category',e.target.value)}><option value="">Keep it unnamed</option>{recipientOptions.map(([v,l])=><option value={v} key={v}>{l}</option>)}</select></label></div>
        <div className="consent-box"><input type="checkbox" checked={form.consent} onChange={e=>update('consent',e.target.checked)}/><p>I understand that this letter may be published publicly after moderation. I have not included private identifying information and agree to the <Link to="/guidelines">community guidelines</Link>.</p></div>
        {error&&<p className="form-error">{error}</p>}
        <button className="button button-dark form-submit" disabled={!form.title.trim()||form.body.trim().length<20||!form.consent} onClick={()=>setPreview(true)}>Preview your letter <ArrowRight size={16}/></button>
      </>:<div className="preview-sheet"><span className="paper-label">A letter, left here · {emotions.find(e=>e.value===form.emotion)?.label}</span><h2>{form.title}</h2><p>{form.body}</p><div className="preview-actions"><button className="button button-outline" onClick={()=>setPreview(false)}>Edit letter</button><button className="button button-dark" onClick={send} disabled={sending}>{sending?'Sending...':'Leave it here'} <Send size={15}/></button></div></div>}
    </div><aside className="write-aside"><div className="aside-note"><Feather/><h3>A gentle reminder</h3><p>You do not need to share your name, email, or the name of the person you're writing to.</p></div><div className="aside-note"><Heart/><h3>Read before you leave</h3><p>Letters are reviewed before they become public. This is a shared space, so please keep it kind and safe.</p></div><p className="aside-foot">No identities. No expectations. No replies required.</p></aside></div>
  </main>
}
function LetterDetail() {
  const {id}=useParams(),[letter,setLetter]=useState(null),[error,setError]=useState(''),[count,setCount]=useState(0),[active,setActive]=useState(false),[reportOpen,setReportOpen]=useState(false),[reported,setReported]=useState(false)
  useEffect(()=>{getLetter(id).then(r=>{setLetter(r.data);setCount(r.data.appreciation_count||0)}).catch(()=>setError('This letter may have been removed or the archive is unavailable.'))},[id])
  const handleAppreciate=async()=>{try{const r=await appreciate(id);setCount(r.data.count);setActive(true)}catch{setError('Appreciation is temporarily unavailable.')}}
  const share=async()=>{const url=window.location.href;if(navigator.share)await navigator.share({title:letter.title,url});else{await navigator.clipboard.writeText(url);alert('Link copied.')}}
  const sendReport=async e=>{e.preventDefault();const data=new FormData(e.target);try{await reportLetter({letter:id,reason:data.get('reason'),details:data.get('details')});setReported(true)}catch{setError('Could not send report. Please try again.')}}
  if(error&&!letter)return <main className="page-shell shell"><div className="error-state">{error}<Link to="/explore">Back to archive</Link></div></main>
  if(!letter)return <main className="page-shell shell"><LoadingCards/></main>
  return <main className="detail-page shell"><Link to="/explore" className="back-link"><ChevronLeft size={16}/> Back to the archive</Link><article className="letter-reading"><div className="reading-top"><span className="emotion-tag">{letter.emotion_label}</span><span>{new Date(letter.published_at).toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric'})}</span></div><h1>{letter.title}</h1><div className="reading-divider"/><div className="reading-body">{letter.body}</div><div className="reading-sign">— someone, somewhere</div><div className="reading-actions"><Appreciation count={count} active={active} onClick={handleAppreciate}/><button className="share-button" onClick={share}>Share this letter <ArrowUpRight size={15}/></button><button className="report-button" onClick={()=>setReportOpen(!reportOpen)}><Flag size={15}/> Report</button></div>
      {reportOpen&&!reported&&<form className="report-form" onSubmit={sendReport}><h3>Tell us what feels wrong</h3><select name="reason"><option value="identifying_info">Personal identifying information</option><option value="harassment">Harassment or bullying</option><option value="threats">Threats</option><option value="hate">Hate or discrimination</option><option value="spam">Spam or malicious links</option><option value="other">Other</option></select><textarea name="details" placeholder="Anything else we should know? (optional)"/><button className="button button-dark">Send report</button></form>}
      {reported&&<p className="success-inline"><Check size={15}/> Thank you. The report has been received.</p>}{error&&<p className="form-error">{error}</p>}</article><div className="reading-bottom"><Quote/><p>Some words feel less lonely<br/><em>when we find them in someone else's.</em></p><Link to="/random" className="text-link">Find another letter <ArrowRight size={16}/></Link></div></main>
}
function Random() {
  const [letter,setLetter]=useState(null),[error,setError]=useState('')
  const load=()=>{setError('');getRandom().then(r=>setLetter(r.data)).catch(()=>setError('No published letters yet. The archive is still growing.'))}
  useEffect(load,[])
  return <main className="random-page shell"><Eyebrow>A small coincidence</Eyebrow><h1>Maybe this was meant<br/><em>to find you.</em></h1>{letter?<div className="random-letter"><span className="emotion-tag">{letter.emotion_label}</span><h2>{letter.title}</h2><p>{letter.body}</p><Link to={`/letter/${letter.id}`} className="text-link">Read quietly <ArrowRight size={16}/></Link></div>:<p>{error||'Finding a letter...'}</p>}<button className="button button-outline" onClick={load}><Shuffle size={16}/> Find another</button></main>
}
function About() {return <main className="editorial-page shell"><Eyebrow>Why this exists</Eyebrow><h1>For the words that<br/><em>stayed with us.</em></h1><div className="editorial-copy"><p>Some words remain with us longer than the moments that created them. An apology. A confession. A goodbye. A thank-you. A sentence we rehearsed a hundred times but never said.</p><p>After the Draft was created for those words. Not to send them. Not to receive a reply. Just to give them somewhere to exist.</p><blockquote>Not everything needs an audience. Sometimes it just needs a place.</blockquote><p>This is an anonymous space, not a social network. There are no profiles, no direct messages, and no expectation of a response. Just people, feelings, and the small relief of putting something into words.</p><Link to="/write" className="button button-dark">Leave a letter <ArrowUpRight size={16}/></Link></div></main>}
function Guidelines() {return <Policy title="Community guidelines" kicker="A shared quiet space" intro="A little care keeps this corner safe for everyone. Every submitted letter is reviewed before it appears publicly." sections={[['Be kind','Write from your own experience. Do not use this space to target, threaten, shame, or harass another person.'],['Protect privacy','Do not include full names, addresses, phone numbers, email addresses, workplaces, schools, social handles, or other details that could identify someone.'],['Share responsibly','No hate speech, threats, explicit sexual content, non-consensual intimate information, spam, scams, or malicious links.'],['Moderation','Submissions are held for human review. We may reject or remove content that risks someone’s safety or violates these guidelines.'],['Need help?','Use the report option on a published letter. Do not use this platform for emergencies or urgent support.']]} />}
function Privacy() {return <Policy title="Privacy, with care" kicker="A note about your data" intro="After the Draft is designed not to ask who you are. That does not mean the internet is capable of absolute anonymity." sections={[['What we ask','You can submit a letter without creating an account or providing your name or email address.'],['What is stored','Letter text, title, selected emotion, optional recipient category, moderation status and timestamps are stored so the service can work. Appreciation uses a pseudonymous browser token.'],['Technical information','The website host, API host or infrastructure providers may process connection and security logs such as IP addresses. Do not assume that using this site makes you untraceable.'],['Public letters','Only approved letters are shown publicly. Once published, visitors may read, copy or share them. Avoid including identifying or sensitive information about yourself or anyone else.'],['Removal and questions','For this local starter version, a public removal-request workflow and support contact have not yet been configured. Do not submit content that you may need urgently removed.']]} />}
function Policy({title,kicker,intro,sections}) {return <main className="editorial-page shell"><Eyebrow>{kicker}</Eyebrow><h1>{title.split(',')[0]}<br/><em>{title.includes(',')?title.split(',').slice(1).join(',').trim():''}</em></h1><div className="editorial-copy"><p>{intro}</p>{sections.map(([h,p])=><section className="policy-section" key={h}><h2>{h}</h2><p>{p}</p></section>)}</div></main>}
function NotFound(){return <main className="success-page"><div className="success-card"><Eyebrow>A little detour</Eyebrow><h1>This page has<br/><em>gone quiet.</em></h1><Link to="/" className="button button-dark">Back home <ArrowRight size={16}/></Link></div></main>}
export default function App(){return <><ScrollReset/><Header/><Routes><Route path="/" element={<Home/>}/><Route path="/explore" element={<Explore/>}/><Route path="/write" element={<Write/>}/><Route path="/letter/:id" element={<LetterDetail/>}/><Route path="/random" element={<Random/>}/><Route path="/about" element={<About/>}/><Route path="/guidelines" element={<Guidelines/>}/><Route path="/privacy" element={<Privacy/>}/><Route path="*" element={<NotFound/>}/></Routes><Footer/></>}
