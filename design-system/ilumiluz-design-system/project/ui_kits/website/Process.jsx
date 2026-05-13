// Process.jsx — the 4-step atelier process
function Process() {
  const steps = [
    { n:'01', name:'Escuta',   body:'Uma conversa para entender histórias, símbolos e intenções.' },
    { n:'02', name:'Desenho',  body:'A ideia ganha forma visual e é validada junto com você.' },
    { n:'03', name:'Criação',  body:'A peça é desenvolvida artesanalmente, com precisão e cuidado.' },
    { n:'04', name:'Entrega',  body:'O resultado de um processo tão importante quanto a peça em si.' },
  ];
  return (
    <section style={{padding:'96px 48px', borderTop:'.5px solid var(--il-line)', background:'var(--il-gold-wash)'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <div style={{marginBottom:56}}>
          <p className="il-eyebrow" style={{marginBottom:20}}>Processo</p>
          <h2 className="il-h" style={{fontSize:44}}>Cada joia nasce de um <em>processo.</em></h2>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:1, background:'var(--il-line)'}}>
          {steps.map(s=>(
            <div key={s.n} style={{background:'var(--il-gold-wash)', padding:'32px 28px', minHeight:220}}>
              <p style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:40, fontWeight:700, lineHeight:1, color:'rgba(201,169,110,0.2)', margin:'0 0 18px'}}>{s.n}</p>
              <p style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:500, fontSize:17, textTransform:'uppercase', letterSpacing:'.04em', color:'var(--il-deep)', margin:'0 0 14px'}}>{s.name}</p>
              <p style={{fontSize:12.5, lineHeight:1.75, color:'var(--il-muted)', margin:0}}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
window.Process = Process;
