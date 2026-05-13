// ContactSection.jsx — "Tudo começa com uma conversa" ether-deep block
function ContactSection() {
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({ name:'', email:'', story:'' });
  return (
    <section style={{padding:'120px 48px', background:'var(--il-ether-deep)', color:'var(--il-off)'}}>
      <div style={{maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'start'}}>
        <div>
          <p style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:'.3em', textTransform:'uppercase', color:'var(--il-gold-light)', margin:'0 0 24px', display:'flex', alignItems:'center', gap:12}}>
            <span style={{width:28, height:'.5px', background:'var(--il-gold)'}}/> Contato
          </p>
          <h2 style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:600, fontSize:56, lineHeight:.95, letterSpacing:'-0.02em', textTransform:'uppercase', color:'var(--il-off)', margin:'0 0 28px'}}>
            Tudo começa com<br/>uma <em style={{fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif", fontWeight:300, fontSize:62, color:'var(--il-gold)', textTransform:'none', letterSpacing:0}}>conversa.</em>
          </h2>
          <p style={{fontSize:13.5, lineHeight:1.85, color:'var(--il-ether-light)', maxWidth:440, margin:'0 0 34px'}}>
            Se este é o momento de criar algo que dure — entre em contato. Respondemos a cada mensagem com o tempo que ela merece.
          </p>
          <div style={{display:'flex', flexDirection:'column', gap:14, fontSize:12.5, color:'var(--il-ether-light)'}}>
            <div style={{display:'flex', gap:16, alignItems:'baseline'}}>
              <span className="il-label" style={{color:'var(--il-gold-light)', minWidth:70}}>Ateliê</span>
              São Paulo, SP
            </div>
            <div style={{display:'flex', gap:16, alignItems:'baseline'}}>
              <span className="il-label" style={{color:'var(--il-gold-light)', minWidth:70}}>Horário</span>
              Ter–Sáb · Com hora marcada
            </div>
            <div style={{display:'flex', gap:16, alignItems:'baseline'}}>
              <span className="il-label" style={{color:'var(--il-gold-light)', minWidth:70}}>Instagram</span>
              @ilumiluz
            </div>
          </div>
        </div>

        <form onSubmit={e=>{e.preventDefault(); setSent(true)}} style={{display:'flex', flexDirection:'column', gap:22}}>
          <Field label="Seu nome" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="Como prefere ser chamada?"/>
          <Field label="Email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="seu@email.com"/>
          <FieldArea label="Sua história" value={form.story} onChange={v=>setForm({...form,story:v})} placeholder="Conte sobre a joia que deseja criar ou transformar..."/>
          <button className="il-ghost" type="submit" style={{color:'var(--il-off)', marginTop:8, alignSelf:'flex-start'}}>
            <i/>{sent ? 'Mensagem enviada' : 'Enviar mensagem'}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({label, value, onChange, placeholder}) {
  return (
    <label style={{display:'flex', flexDirection:'column', gap:8}}>
      <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, letterSpacing:'.25em', textTransform:'uppercase', color:'var(--il-gold-light)'}}>{label}</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:'transparent', border:'none', borderBottom:'.5px solid rgba(224,201,154,.3)', padding:'12px 0', fontFamily:"'Barlow',sans-serif", fontSize:13.5, fontWeight:300, color:'var(--il-off)', outline:'none', transition:'border-color .25s'}}
        onFocus={e=>e.target.style.borderBottomColor='var(--il-gold)'}
        onBlur={e=>e.target.style.borderBottomColor='rgba(224,201,154,.3)'}
      />
    </label>
  );
}
function FieldArea({label, value, onChange, placeholder}) {
  return (
    <label style={{display:'flex', flexDirection:'column', gap:8}}>
      <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, letterSpacing:'.25em', textTransform:'uppercase', color:'var(--il-gold-light)'}}>{label}</span>
      <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={4}
        style={{background:'transparent', border:'.5px solid rgba(224,201,154,.3)', padding:14, fontFamily:"'Barlow',sans-serif", fontSize:13.5, fontWeight:300, color:'var(--il-off)', outline:'none', resize:'vertical', transition:'border-color .25s'}}
        onFocus={e=>e.target.style.borderColor='var(--il-gold)'}
        onBlur={e=>e.target.style.borderColor='rgba(224,201,154,.3)'}
      />
    </label>
  );
}
window.ContactSection = ContactSection;
