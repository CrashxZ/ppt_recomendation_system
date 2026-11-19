export function trajectoryError(scene, model, horizon) {
  const count = Math.round(horizon / 0.2);
  const distances = scene.pred[model].slice(0, count).map((point, index) =>
    Math.hypot(point[0] - scene.fut[index][0], point[1] - scene.fut[index][1]),
  );
  return {
    ade: distances.reduce((sum, distance) => sum + distance, 0) / count,
    fde: distances[count - 1],
  };
}

export function interpolate(times, points, time) {
  if (time <= times[0]) return points[0];
  for (let index = 1; index < times.length; index += 1) {
    if (time <= times[index]) {
      const fraction = (time - times[index - 1]) / (times[index] - times[index - 1]);
      return points[index].map((value, axis) =>
        points[index - 1][axis] + fraction * (value - points[index - 1][axis]),
      );
    }
  }
  return points[points.length - 1];
}

// A null separates sequential client-training blocks. Never join across that gap.
export function linePath(points, x, y, maxStep = Infinity) {
  let start = true;
  return points.map((point) => {
    if (!point || point[0] > maxStep) {
      start = true;
      return "";
    }
    const command = `${start ? "M" : "L"}${x(point[0])},${y(point[1])}`;
    start = false;
    return command;
  }).join(" ");
}
