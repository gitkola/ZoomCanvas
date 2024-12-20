export const Grid = () => {
  // Create a large enough area for the grid (50x50 cells)
  const gridSize = 5000
  const cellSize = 100

  return (
    <div
      className="absolute"
      style={{
        width: `${gridSize}px`,
        height: `${gridSize}px`,
        backgroundImage: `
          linear-gradient(to right, #ddd 1px, transparent 1px),
          linear-gradient(to bottom, #ddd 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
      }}
    />
  )
}
