export default function Loading() {
  const shimmer = {
    background: 'linear-gradient(90deg, #f0f3f8 25%, #e0e6ef 50%, #f0f3f8 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }
  return (
    <div style={{ minHeight: '100vh', background: '#F6F8FB', padding: '24px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ height: 14, width: 200, borderRadius: 6, marginBottom: 32, ...shimmer }} />
        <div style={{ height: 48, borderRadius: 10, marginBottom: 16, ...shimmer }} />
        <div style={{ height: 24, width: '60%', borderRadius: 8, marginBottom: 32, ...shimmer }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ height: 18, borderRadius: 6, marginBottom: 12, width: i % 3 === 0 ? '80%' : '100%', ...shimmer }} />
        ))}
        <div style={{ height: 200, borderRadius: 12, marginTop: 32, ...shimmer }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
