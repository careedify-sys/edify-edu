// Loading skeleton for University page
export default function Loading() {
  const shimmerStyle = {
    background: 'linear-gradient(90deg, #f0f3f8 25%, #e0e6ef 50%, #f0f3f8 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  }
  return (
    <div className="min-h-screen bg-[#F6F8FB] p-5 sm:p-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Breadcrumb skeleton */}
        <div style={{ height: 16, width: 240, borderRadius: 'var(--r-xs)', marginBottom: 24, ...shimmerStyle }}/>
        {/* Hero card skeleton */}
        <div style={{ height: 200, borderRadius: 'var(--r-md)', marginBottom: 20, ...shimmerStyle }}/>
        {/* Content skeletons */}
        {[1,2,3].map(i => (
          <div key={i} style={{ height: 120, borderRadius: 14, marginBottom: 16, ...shimmerStyle }}/>
        ))}
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
