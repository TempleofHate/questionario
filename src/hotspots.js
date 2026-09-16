// Coordinates are percentages of the complete, uncropped photograph.
export function containsPoint(hotspots, point) {
  return hotspots.some(polygon => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
      const cross = (point.x - xi) * (yj - yi) - (point.y - yi) * (xj - xi);
      if (Math.abs(cross) < 1e-8 && point.x >= Math.min(xi, xj) && point.x <= Math.max(xi, xj) && point.y >= Math.min(yi, yj) && point.y <= Math.max(yi, yj)) return true;
      if ((yi > point.y) !== (yj > point.y) && point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  });
}
export const validPoint = point => point && [point.x, point.y].every(n => Number.isFinite(n) && n >= 0 && n <= 100);
