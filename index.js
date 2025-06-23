import { DragManager } from "./drag-manager.js";
import { ImageProcessor } from "./image-processor.js";

/** @type {ImageProcessor} */
let processor;

(async () => {
  processor = new ImageProcessor();
  await processor.init("output");
  processor.area = {
    topLeft: { x: 50, y: 50 },
    topRight: { x: 300, y: 50 },
    bottomRight: { x: 300, y: 300 },
    bottomLeft: { x: 50, y: 300 },
  };
  const dragManager = new DragManager();
  dragManager.init(processor, "container");

  setInterval(() => process(), 100);
})();

function boostColor(color) {
  const max = Math.max(color.r, color.g, color.b);
  return {
    r: color.r === max ? 255 : color.r,
    g: color.g === max ? 255 : color.g,
    b: color.b === max ? 255 : color.b,
  };
}

function process() {
  const result = processor.read();
  const color = boostColor({
    r: (result.left[0].r + result.right[0].r) / 2,
    g: (result.left[0].g + result.right[0].g) / 2,
    b: (result.left[0].b + result.right[0].b) / 2,
  });

  document.body.style.background = `rgba(${color.r}, ${color.g}, ${color.b})`;
  window.api.setColor(color);
}
