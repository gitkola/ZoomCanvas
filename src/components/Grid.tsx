export const Grid = () => {
  // Create a large enough area for the grid (50x50 cells)
  const gridSize = 5000
  const cellSize = 100

  return (
    <div
      className="absolute grid-background"
      style={{
        width: `${gridSize}px`,
        height: `${gridSize}px`,
        top: `-${gridSize / 2}px`,
        left: `-${gridSize / 2}px`,
        backgroundImage: `
          linear-gradient(to right, #ddd 1px, transparent 1px),
          linear-gradient(to bottom, #ddd 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
      }}
    />
  )
}
