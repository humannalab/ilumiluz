// Collection.jsx — product grid
function Collection() {
  const items = [
    { img:'colecao-essencial-refeito.png', tag:'Sob medida', title:'O Essencial, Refeito', desc:'Metal reimaginado. Uma peça pensada para marcar um novo ciclo.' },
    { img:'colecao-joias-significado.png', tag:'Transformação', title:'Joias com História', desc:'Peças herdadas que ganham nova forma sem perder a memória.' },
    { img:'produto-colar-portal.png', tag:'Pronta entrega', title:'Colar Portal', desc:'Ouro 18k com esmeralda brasileira. Peça sob consulta.' },
  ];
  return (
    <section style={{padding:'96px 48px', borderTop:'.5px solid var(--il-line)'}}>
      <div style={{maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:56}}>
          <div>
            <p className="il-eyebrow" style={{marginBottom:20}}>Coleção</p>
            <h2 className="il-h" style={{fontSize:44, lineHeight:1}}>Criações <em>em curso.</em></h2>
          </div>
          <a className="il-ghost" href="#"><i/>Ver tudo</a>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24}}>
          {items.map((it,i)=> <ProductCard key={i} {...it}/>)}
        </div>
      </div>
    </section>
  );
}

function ProductCard({img, tag, title, desc}) {
  const [h, setH] = React.useState(false);
  return (
    <article
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{
        background:'var(--il-off)',
        border:'.5px solid',
        borderColor: h ? 'var(--il-gold)' : 'var(--il-line)',
        overflow:'hidden', cursor:'pointer', transition:'border-color .3s',
        position:'relative'
      }}>
      <div style={{height:280, overflow:'hidden', background:'var(--il-warm-mid)'}}>
        <div style={{
          height:'100%', width:'100%',
          backgroundImage:`url(../../assets/${img})`,
          backgroundSize:'cover', backgroundPosition:'center',
          transform: h ? 'scale(1.05)' : 'scale(1)',
          transition:'transform .5s var(--il-ease)'
        }}/>
      </div>
      <div style={{padding:'22px 26px 26px'}}>
        <p className="il-label" style={{marginBottom:10}}>{tag}</p>
        <h3 style={{fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontWeight:300, fontSize:24, color:'var(--il-deep)', margin:'0 0 10px'}}>{title}</h3>
        <p style={{fontSize:12.5, lineHeight:1.7, color:'var(--il-muted)', margin:0}}>{desc}</p>
        <div style={{marginTop:18, display:'flex', alignItems:'center', gap:10,
          fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, letterSpacing:'.22em', textTransform:'uppercase',
          color:'var(--il-deep)', opacity: h?1:0, transition:'opacity .3s'
        }}>
          <span style={{width:16, height:'.5px', background:'var(--il-gold)'}}/>
          Ver peça
        </div>
      </div>
      <span style={{
        position:'absolute', left:0, right:0, bottom:0, height:1.5, background:'var(--il-gold)',
        transform: h ? 'scaleX(1)' : 'scaleX(0)', transformOrigin:'left', transition:'transform .35s var(--il-ease)'
      }}/>
    </article>
  );
}
window.Collection = Collection;
window.ProductCard = ProductCard;
