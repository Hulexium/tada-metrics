import { Component, createEffect, createSignal, onCleanup } from "solid-js";

interface Click {
  x: number;
  y: number;
}

interface GridCell {
  x: number;
  y: number;
  count: number;
}

interface DensityArea {
  x: number;
  y: number;
  count: number;
}

const Heatmap: Component = () => {
  const [clicks, setClicks] = createSignal<Click[]>([]);
  const radius = 50; // Size of grid cell in pixels

  let ref: HTMLCanvasElement | undefined;

  const handleCanvasClick = (e: MouseEvent) => {
    const rect = (e.currentTarget as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setClicks([...clicks(), { x, y }]);
  };

  // Aggregate clicks into grid cells
  // const aggregateClicks = (clicks: Click[]): GridCell[] => {
  //   const grid: GridCell[] = [];
  //   clicks.forEach(({ x, y }) => {
  //     const gridX = Math.floor(x / gridSize);
  //     const gridY = Math.floor(y / gridSize);
  //     const key = `${gridX}-${gridY}`;
  //     let cell = grid.find((c) => `${c.x}-${c.y}` === key);
  //     if (!cell) {
  //       cell = { x: gridX, y: gridY, count: 0 };
  //       grid.push(cell);
  //     }
  //     cell.count++;
  //   });
  //   return grid;
  // };
  //
  // // Map heat level to color
  // //
  // const getHeatColor = (count: number, maxCount: number): string => {
  //   const intensity = count / maxCount;
  //   // Example gradient: blue (cool) to red (hot)
  //   const red = Math.min(255, Math.round(255 * intensity));
  //   const blue = 255 - red;
  //   return `rgb(${red}, 0, ${blue})`;
  // };
  //
  // const drawHeatmap = () => {
  //   const canvas = ref;
  //   const c = clicks();
  //
  //   if (canvas) {
  //     const ctx = canvas.getContext("2d");
  //     if (ctx) {
  //       ctx.clearRect(0, 0, canvas.width, canvas.height);
  //       const grid = aggregateClicks(c);
  //       const maxCount = Math.max(...grid.map((c) => c.count));
  //       grid.forEach(({ x, y, count }) => {
  //         ctx.fillStyle = getHeatColor(count, maxCount);
  //         ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
  //       });
  //     }
  //   }
  // };
  //

  const getHeatColor = (count: number, maxCount: number): string => {
    const intensity = count / maxCount;
    // Example gradient: blue (cool) to red (hot)
    const red = Math.min(255, Math.round(255 * intensity));
    const blue = 255 - red;
    return `rgba(${red}, 0, ${blue}, ${intensity})`;
  };

  // Calculate density around each click and return as areas with density info
  const calculateDensity = (clicks: Click[]): DensityArea[] => {
    return clicks.map((click) => {
      const nearbyClicks = clicks.filter(
        (other) => Math.hypot(other.x - click.x, other.y - click.y) <= radius,
      ).length;
      return { ...click, count: nearbyClicks };
    });
  };

  // Map density to circle color and size
  const getCircleProperties = (count: number, maxCount: number) => {
    const intensity = count / maxCount;
    // const color = `rgba(255, 0, 0, ${intensity})`; // Adjust alpha based on intensity
    const color = getHeatColor(count, maxCount); // Adjust alpha based on intensity
    const size = radius * intensity; // Adjust size based on intensity
    return { color, size };
  };

  const drawHeatmap = () => {
    const canvas = ref;
    const c = clicks();

    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const densityAreas = calculateDensity(c);
        const maxCount = Math.max(...densityAreas.map((c) => c.count));
        densityAreas.forEach(({ x, y, count }) => {
          const { color, size } = getCircleProperties(count, maxCount);
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
      }
    }
  };

  createEffect(() => {
    console.log("click: ", clicks());

    drawHeatmap();
  });

  return (
    <>
      <button onClick={() => drawHeatmap()}>Click</button>
      <div style="position: relative; width: 100%; height: 500px; background-image: url('/image.webp'); background-repeat: no-repeat, repeat;">
        <canvas
          width="500"
          height="500"
          onClick={handleCanvasClick}
          ref={ref}
        />
      </div>
    </>
  );
};

export default Heatmap;
