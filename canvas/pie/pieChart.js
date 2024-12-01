import { drawPieSlice } from "./geometry/index.js";
import { checkCollision, drawPolyline, drawText } from "./util.js";

export class PieChart {
  constructor(options) {
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;
    this.titleOptions = options.titleOptions;
    this.totalValue = [...Object.values(this.options.data)].reduce(
      (a, b) => a + b,
      0
    );
    this.radius =
      Math.min(this.canvas.width / 2, this.canvas.height / 2) - options.padding;
    this.v = 0.5;
    this.r = this.radius;
    this.t = 3;
    this.hoverId = -1;
    this.deg = 0;
    this.init();
  }

  init() {
    // 初始化监听hover
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  drawSlices() {
    // 绘制饼图
    let colorIndex = 0;
    let startAngle = -Math.PI / 2;

    for (let categ in this.options.data) {
      let val = this.options.data[categ];
      let sliceAngle = (2 * Math.PI * val) / this.totalValue;

      drawPieSlice(
        this.ctx,
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.hoverId === colorIndex ? this.setV() : this.radius,
        startAngle,
        startAngle + sliceAngle,
        this.colors[colorIndex % this.colors.length],
        this.hoverId === colorIndex && this.isHover
      );
      startAngle += sliceAngle;
      colorIndex++;
    }
  }

  drawGuideLine() {
    let index = 0;
    let startAngle = -Math.PI / 2;
    const outerRadius = 10 + this.radius;
    let isRight = true;
    let sumAngle = 0;
    const guideLineWidth = 30;
    for (let k in this.options.data) {
      let val = this.options.data[k];
      const angle = (val / 100) * 360;
      // 计算左右位置
      sumAngle += angle;

      if (sumAngle >= 180) isRight = false;

      let sliceAngle = (angle * Math.PI) / 180;
      const midAngle = startAngle + sliceAngle / 2;
      const x = this.canvas.width / 2 + Math.cos(midAngle) * this.radius;
      const y = this.canvas.height / 2 + Math.sin(midAngle) * this.radius;

      // 计算外圈的坐标
      const x2 = this.canvas.width / 2 + Math.cos(midAngle) * outerRadius;
      const y2 = this.canvas.height / 2 + Math.sin(midAngle) * outerRadius;

      // 计算引线末端
      const x3 = isRight ? x2 + guideLineWidth : x2 - guideLineWidth;

      // 绘制折线
      drawPolyline(
        this.ctx,
        [
          { x, y },
          { x: x2, y: y2 },
          { x: x3, y: y2 },
        ],
        this.options.colors[index]
      );
      // 绘制文本
      drawText(this.ctx, k, isRight ? x3 + 4 : x3 - k.length * 6, y2 + 3);

      startAngle += sliceAngle;
      index++;
    }
  }

  setV() {
    this.t = Math.max(this.t - 0.06, 2);
    const v = this.v * this.t;
    if (this.isHover) {
      this.r = Math.min(this.r + v, 140);
    } else {
      this.r = Math.max(this.r - v, this.radius);
    }
    return this.r;
  }

  onMouseMove(e) {
    const { clientX, clientY } = e;
    const cx = clientX - this.canvas.offsetLeft;
    const cy = clientY - this.canvas.offsetTop;

    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    // 计算鼠标样式
    this.isHover = checkCollision(cx, cy, centerX, centerY, this.radius);
    document.body.style.cursor = this.isHover ? "pointer" : "default";

    // 计算弧度
    const angle = Math.atan2(cy - centerY, cx - centerX);

    // 计算角度
    let deg = (angle * 180) / Math.PI + 90;
    if (deg < 0) {
      deg += 360;
    }

    // 计算角度得到 hoverId
    let index = 0;
    let oldAngle = 0;
    for (let k in this.options.data) {
      let val = this.options.data[k];
      let newAngle = oldAngle + (val / 100) * 360; //每块的角度
      if (oldAngle < deg && deg < newAngle) {
        // 连续hover重置r来实现过渡
        if (this.hoverId !== index) {
          this.t = 3;
          this.r = this.radius;
        }
        this.hoverId = index;
      }
      oldAngle = newAngle;
      index++;
    }
    this.deg = deg;
  }

  drawLabels() {
    // 绘制文本
  }

  drawTitle() {
    // 绘制标题
  }

  drawLegend() {
    // 绘制图例
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawSlices();
    this.drawLabels();
    this.drawGuideLine();
    requestAnimationFrame(this.draw.bind(this));
  }
}
