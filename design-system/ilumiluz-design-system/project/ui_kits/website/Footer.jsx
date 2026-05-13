// Footer.jsx — deep footer with wordmark and links
function Footer() {
  return (
    <footer style={{background:'var(--il-deep)', color:'var(--il-gold-light)', padding:'72px 48px 40px'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:48, paddingBottom:56, borderBottom:'.5px solid rgba(201,169,110,.2)'}}>
          <div>
            <p style={{fontFamily:"'Jost','Barlow Condensed',sans-serif", fontWeight:200, fontSize:28, letterSpacing:'.14em', color:'var(--il-off)', margin:'0 0 18px'}}>ilumiluz</p>
            <p style={{fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontWeight:300, fontSize:18, color:'var(--il-gold)', margin:'0 0 24px'}}>
              É a tua luz que ilumina o mundo.
            </p>
            <p style={{fontSize:12, lineHeight:1.75, color:'rgba(224,201,154,.7)', maxWidth:340, margin:0}}>
              Ateliê de joias contemporâneas. Peças sob medida e transformação de joias herdadas. São Paulo — por hora marcada.
            </p>
          </div>
          <FooterCol title="Navegar" links={['Coleção','Sobre','Processo','Contato']}/>
          <FooterCol title="Ateliê" links={['Agendar visita','Transformar joia','Catálogo','WhatsApp']}/>
          <FooterCol title="Seguir" links={['Instagram','Pinterest','Email','Newsletter']}/>
        </div>
        <div style={{marginTop:28, display:'flex', justifyContent:'space-between', fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(224,201,154,.4)'}}>
          <span>© 2026 Ilumiluz</span>
          <span>Feito com presença</span>
          <span>Política de privacidade</span>
        </div>
      </div>
    </footer>
  );
}
function FooterCol({title, links}) {
  return (
    <div>
      <p style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, letterSpacing:'.3em', textTransform:'uppercase', color:'var(--il-gold)', margin:'0 0 20px'}}>{title}</p>
      <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12}}>
        {links.map(l=>(
          <li key={l}><a href="#" style={{fontSize:12.5, color:'var(--il-gold-light)', transition:'color .2s'}}
            onMouseEnter={e=>e.currentTarget.style.color='var(--il-off)'}
            onMouseLeave={e=>e.currentTarget.style.color='var(--il-gold-light)'}>{l}</a></li>
        ))}
      </ul>
    </div>
  );
}
window.Footer = Footer;
