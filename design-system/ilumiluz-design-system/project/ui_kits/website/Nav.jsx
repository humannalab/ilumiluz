// Nav.jsx — Ilumiluz top navigation
function Nav({ current = 'Coleção', onNavigate }) {
  const links = ['Coleção', 'Sobre', 'Processo', 'Contato'];
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <nav style={{
      position:'sticky', top:0, zIndex:30,
      background: scrolled ? 'rgba(247,243,236,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(10px)' : 'none',
      borderBottom: scrolled ? '0.5px solid var(--il-line)' : '0.5px solid transparent',
      transition: 'background .3s, border-color .3s',
    }}>
      <div style={{maxWidth:1280, margin:'0 auto', padding:'22px 48px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <a href="#" onClick={e=>{e.preventDefault(); onNavigate && onNavigate('Coleção')}} style={{
          fontFamily:"'Jost','Barlow Condensed',sans-serif",
          fontWeight:200, fontSize:19, letterSpacing:'.14em', color:'var(--il-deep)'
        }}>ilumiluz</a>
        <div style={{display:'flex', gap:30}}>
          {links.map(l => (
            <a key={l} href="#" onClick={e=>{e.preventDefault(); onNavigate && onNavigate(l)}} style={{
              fontFamily:"'Barlow Condensed',sans-serif",
              fontSize:10.5, letterSpacing:'.22em', textTransform:'uppercase',
              color: current===l ? 'var(--il-deep)' : 'var(--il-muted)',
              paddingBottom:4, position:'relative', cursor:'pointer'
            }} className={`il-navlink ${current===l?'on':''}`}>{l}</a>
          ))}
          <span style={{width:1, background:'var(--il-line-dark)'}}/>
          <a href="#" style={{
            fontFamily:"'Barlow Condensed',sans-serif",
            fontSize:10.5, letterSpacing:'.22em', textTransform:'uppercase',
            color:'var(--il-gold)'
          }}>PT · EN</a>
        </div>
      </div>
      <style>{`
        .il-navlink::after{content:'';position:absolute;left:0;right:0;bottom:0;height:.5px;background:var(--il-gold);transform:scaleX(0);transform-origin:left;transition:transform .3s var(--il-ease)}
        .il-navlink:hover{color:var(--il-deep)}
        .il-navlink:hover::after,.il-navlink.on::after{transform:scaleX(1)}
      `}</style>
    </nav>
  );
}
window.Nav = Nav;
