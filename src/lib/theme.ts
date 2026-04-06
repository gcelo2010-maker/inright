export const T = {
  bg: '#0a0a0f',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  gold: '#c9a84c',
  goldLight: '#f0c060',
  white: '#ffffff',
  muted: '#888888',
  dim: '#444444',
  green: '#4ade80',
  red: '#f87171',
  amber: '#f59e0b',
  violet: '#a78bfa',
  cyan: '#67e8f9',
  radius: '16px',
  radiusSm: '12px',
}

export const css = {
  page: {background:'#0a0a0f',minHeight:'100vh',color:'#fff',padding:'20px 16px 24px'} as React.CSSProperties,
  card: {background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'16px',padding:'16px'} as React.CSSProperties,
  label: {fontSize:'10px',color:'#888',textTransform:'uppercase' as const,letterSpacing:'1px',margin:'0 0 4px'},
  h1: {fontSize:'26px',fontWeight:'800' as const,letterSpacing:'-1px',margin:0,background:'linear-gradient(135deg,#fff 0%,#c9a84c 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'},
  badge: (color: string) => ({fontSize:'10px',background:`${color}20`,color,border:`1px solid ${color}40`,padding:'3px 10px',borderRadius:'20px',fontWeight:'600' as const,display:'inline-block'}),
}

export const fmt = (n: number) => {
  if (!n && n!==0) return '0'
  if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(2)+'M'
  if (Math.abs(n) >= 1000) return (n/1000).toFixed(0)+'K'
  return new Intl.NumberFormat('sq-AL',{maximumFractionDigits:0}).format(n)
}

export const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('sq-AL',{day:'2-digit',month:'short',year:'numeric'}) : ''
