import { Point } from "./point.js";
import { Grid } from "./grid.js";
import { AreaParser } from "./area-parser.js";

export class ImageProcessor {
  /**
   * Video tag
   * @type {HTMLVideoElement}
   */
  #video;

  /**
   * Offscreen canvas used to build image data.
   * @type {HTMLCanvasElement}
   */
  #offscreenCanvas;

  /**
   * 2D context of the offscreen canvas.
   * @type {CanvasRenderingContext2D}
   */
  #offscreenCtx;

  /**
   * Output screen for processed feed.
   * @type {HTMLCanvasElement}
   */
  #outputCanvas;

  /**
   * 2D context of the output canvas.
   * @type {CanvasRenderingContext2D}
   */
  #outputCtx;

  /**
   * Is setup complete.
   * @type {boolean}
   */
  #isSetupComplete = false;

  /**
   * Grid area.
   * @type {Grid}
   */
  #area;

  /**
   * Top line parsers.
   * @type {AreaParser[]}
   */
  #topParsers;

  /**
   * Bottom line parsers.
   * @type {AreaParser[]}
   */
  #bottomParsers;

  /**
   * Left column parsers.
   * @type {AreaParser[]}
   */
  #leftParsers;

  /**
   * Right column parsers.
   * @type {AreaParser[]}
   */
  #rightParsers;

  /**
   * Init Image Processor
   * @param {string} outputCanvasId ID of the output canvas.
   */
  async init(outputCanvasId) {
    const stream = await this.#fetchWebcamStream();
    this.#buildVideoTag(stream);
    this.#buildCanvas(outputCanvasId);
    this.#process();
    this.#area = new Grid(1, 0);
    this.#prepareParsers();
  }

  /**
   * Read output from parsers.
   * @returns Array of parser outputs
   */
  read() {
    const data = this.#offscreenCtx.getImageData(
      0,
      0,
      this.#video.videoWidth,
      this.#video.videoHeight
    ).data;

    return {
      top: this.#topParsers.map((parser) => parser.process(data)),
      bottom: this.#bottomParsers.map((parser) => parser.process(data)),
      left: this.#leftParsers.map((parser) => parser.process(data)),
      right: this.#rightParsers.map((parser) => parser.process(data)),
    };
  }

  /**
   * Set selected area.
   * @param {{ topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point }} area Area coordinates
   */
  set area({ topLeft, topRight, bottomRight, bottomLeft }) {
    this.#area.coordinates = { topLeft, topRight, bottomRight, bottomLeft };
    this.#prepareParsers();
  }

  /**
   * Get selected area.
   * @returns {{ topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point }} Area coordinates
   */
  get area() {
    return {
      topLeft: this.#area.coordinates[0],
      topRight: this.#area.coordinates[1],
      bottomRight: this.#area.coordinates[2],
      bottomLeft: this.#area.coordinates[3],
    };
  }

  /**
   * Fetch webcam stream.
   */
  async #fetchWebcamStream() {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  }

  /**
   * Build video tag.
   * @param {MediaStream} stream Stream to play
   */
  #buildVideoTag(stream) {
    this.#video = document.createElement("video");
    this.#video.srcObject = stream;
    this.#video.play();
  }

  /**
   * Build canvas for image processing and output.
   * @param {string} outputCanvasId ID of the output canvas.
   */
  #buildCanvas(outputCanvasId) {
    this.#offscreenCanvas = new OffscreenCanvas(0, 0);
    this.#offscreenCtx = this.#offscreenCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    this.#outputCanvas = document.getElementById(outputCanvasId);
    this.#outputCanvas.height = 0;
    this.#outputCanvas.width = 0;
    this.#outputCtx = this.#outputCanvas.getContext("2d");
  }

  #process() {
    if (this.#video.videoHeight == 0 || this.#video.videoWidth == 0) {
      requestAnimationFrame(this.#process.bind(this));
      return;
    }

    if (!this.#isSetupComplete) {
      this.#offscreenCanvas.height = this.#video.videoHeight;
      this.#offscreenCanvas.width = this.#video.videoWidth;
      this.#outputCanvas.height = this.#video.videoHeight;
      this.#outputCanvas.width = this.#video.videoWidth;
      this.#isSetupComplete = true;
    }

    this.#offscreenCtx.drawImage(
      this.#video,
      0,
      0,
      this.#video.videoWidth,
      this.#video.videoHeight
    );
    const imageData = this.#offscreenCtx.getImageData(
      0,
      0,
      this.#video.videoWidth,
      this.#video.videoHeight
    );

    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = (i / 4) % this.#video.videoWidth;
      const y = Math.floor(i / 4 / this.#video.videoWidth);

      if (!this.#area.isPointInside({ x, y })) {
        imageData.data[i + 3] = 50;
      }
    }

    this.#outputCtx.putImageData(imageData, 0, 0);

    requestAnimationFrame(this.#process.bind(this));
  }

  #prepareParsers() {
    const regions = this.#area.getRegions();
    this.#topParsers = regions.top.map((region) => new AreaParser(region));
    this.#bottomParsers = regions.bottom.map(
      (region) => new AreaParser(region)
    );
    this.#leftParsers = regions.left.map((region) => new AreaParser(region));
    this.#rightParsers = regions.right.map((region) => new AreaParser(region));
  }
}
