export function drawPolyline(ctx, points, color, lineWidth) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

export function drawText(ctx, text, x, y, font, color) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function checkCollision(x, y, circleX, circleY, radius) {
  const distance = Math.sqrt(
    Math.pow(circleX - x, 2) + Math.pow(circleY - y, 2)
  );
  if (distance <= radius) {
    // 发生碰撞
    return true;
  }
  // 未发生碰撞
  return false;
}
