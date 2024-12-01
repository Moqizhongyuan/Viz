import { drawLine, drawBar } from "./geometry/index.js";

class BarChart {
  constructor(options) {
    // 配置对象
    this.options = options;
    // 通用访问的属性
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;
    this.titleOptions = options.titleOptions;
    this.maxValue = Math.max(...Object.values(this.options.data));
    // 得到实际的图表尺寸
    this.canvasActualHeight = this.canvas.height - this.options.padding * 2;
    this.canvasActualWidth = this.canvas.width - this.options.padding * 2;
    // 存储柱子的位置信息等
    this.barInfo = [];
    this.hoverId = -1;
    this.firstRender = true;
    this.currentHeights = [0, 0, 0, 0];
    this.t = 1;
    this.v = 5;
    this.init();
  }
  init() {
    // 初始化监听hover
    this.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
  }
  onMouseMove(e) {
    const { clientX, clientY } = e;
    const cx = clientX - this.canvas.offsetLeft;
    const cy = clientY - this.canvas.offsetTop + window.scrollY;
    this.hoverId = -1;
    for (let i = 0; i < this.barInfo.length; i++) {
      const pos = this.barInfo[i];
      const { x, y, width, height } = pos;
      const right = x + width;
      const bottom = y + height;

      if (cx <= right && cx >= x && cy >= y && cy <= bottom) {
        this.hoverId = i;
      }
    }
    this.updateLabels(clientX, clientY);
  }
  drawLabels() {
    this.labelContainer = document.createElement("div");
    this.labelContainer.id = "label-warp";
    document.body.appendChild(this.labelContainer);
  }
  updateLabels(cx, cy) {
    const dataList = Object.entries(this.options.data);
    if (this.hoverId >= 0) {
      this.labelContainer.style.visibility = "visible";
      this.labelContainer.style.top = cy + 10 + "px";
      this.labelContainer.style.left = cx + 10 + "px";
      const item = dataList[this.hoverId];
      this.labelContainer.innerHTML = `<div style='background: ${
        this.colors[this.hoverId < 0 ? 0 : this.hoverId]
      }; ' class='label-cir'></div><div class='label-common label-name'>${
        item[0]
      }</div><div class='label-common label-val'>${item[1]}</div>`;
    } else {
      this.labelContainer.style.visibility = "hidden";
    }
  }

  drawGridLines() {
    let gridValue = 0;
    while (gridValue <= this.maxValue) {
      // 限制范围计算实际的 Y 坐标
      const gridY =
        this.canvasActualHeight * (1 - gridValue / this.maxValue) +
        this.options.padding;
      drawLine(
        this.ctx,
        0,
        gridY,
        this.canvas.width,
        gridY,
        this.options.gridColor
      );

      // 绘制Y轴文本
      this.ctx.save();
      this.ctx.fillStyle = this.options.gridColor;
      this.ctx.textBaseline = "bottom";
      this.ctx.font = "bold 10px Arial";
      this.ctx.fillText(gridValue, 0, gridY - 2);
      this.ctx.restore();
      gridValue += this.options.gridStep;
    }
  }

  drawBars() {
    // 用于计算 x 坐标
    let barIndex = 0;
    // 总数
    const numberOfBars = Object.keys(this.options.data).length;
    // bar 尺寸
    const barSize = this.canvasActualWidth / numberOfBars;
    const values = Object.values(this.options.data);
    for (const val of values) {
      // 计算高度百分比
      const barHeight = Math.round(
        (this.canvasActualHeight * val) / this.maxValue
      );

      this.t = Math.max(this.t - 0.01, 0);
      let v = (barHeight / this.t) * 0.02;
      const color =
        this.hoverId === barIndex
          ? this.options.hoverColor
          : this.colors[barIndex];

      this.currentHeights[barIndex] = Math.min(
        this.currentHeights[barIndex] + v,
        barHeight
      );
      const x = this.options.padding + barIndex * barSize;
      const y =
        this.canvas.height -
        this.options.padding -
        this.currentHeights[barIndex];

      if (this.currentHeights[barIndex] === barHeight) {
        this.barInfo[barIndex] = { x, y, width: barSize, height: barHeight };
      }

      // 绘制
      drawBar(this.ctx, x, y, barSize, this.currentHeights[barIndex], color);
      barIndex++;
    }
  }

  drawTitle() {
    this.ctx.save();
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = this.titleOptions.align;
    this.ctx.fillStyle = this.titleOptions.fill;
    this.ctx.font = `${this.titleOptions.font.weight} ${this.titleOptions.font.size} ${this.titleOptions.font.family}`;
    let xPos = this.canvas.width / 2;
    if (this.titleOptions.align == "left") {
      xPos = 10;
    }
    if (this.titleOptions.align == "right") {
      xPos = this.canvas.width - 10;
    }
    this.ctx.fillText(this.options.seriesName, xPos, this.canvas.height);
    this.ctx.restore();
  }
  drawLegend() {
    let pIndex = 0;
    let legend = document.querySelector("legend[for='myCanvas']");
    let ul = document.createElement("ul");
    legend.append(ul);
    for (let ctg of Object.keys(this.options.data)) {
      let li = document.createElement("li");
      li.style.listStyle = "none";
      li.style.borderLeft =
        "20px solid " + this.colors[pIndex % this.colors.length];
      li.style.padding = "5px";
      li.textContent = ctg;
      ul.append(li);
      pIndex++;
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // dom 渲染是否是第一次
    if (this.firstRender) {
      this.drawLabels();
      this.drawLegend();
      this.firstRender = false;
    }
    this.drawTitle();
    this.drawGridLines();
    this.drawBars();
    requestAnimationFrame(this.draw.bind(this));
  }
}

export { BarChart };
