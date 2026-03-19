// components/SkeletonGrid.tsx
export default function SkeletonGrid() {
  const heights = [200, 280, 180, 320, 240, 260, 200, 300, 180, 250]
  return (
    <div className="masonry-grid">
      {heights.map((h, i) => (
        <div key={i} className="masonry-item">
          <div className="rounded-2xl overflow-hidden bg-surface border border-border">
            <div className="skeleton w-full" style={{ height: `${h}px` }} />
            <div className="p-3 space-y-2">
              <div className="skeleton h-3 rounded-full w-3/4" />
              <div className="skeleton h-3 rounded-full w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
