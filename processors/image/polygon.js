import { PointInsideStrategy } from "./point-inside-strategy.js";
import { Point } from "./point.js";

export class Polygon {
  /**
   * Polygon coordinates
   * @type {Point[]}
   */
  #coordinates = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ];

  /**
   * Return whether specified point is inside the polygon
   * @type {PointInsideStrategy}
   */
  #isPointInsideStrategy = {
    isPointInside: () => false,
    prepareStrategy: () => {},
    getRegion: () => [],
  };

  /**
   * Return whether specified point is inside the polygon
   * @param {Point} point Point to check.
   * @returns Is point inside the polygon.
   */
  isPointInside(point) {
    return this.#isPointInsideStrategy.isPointInside(point);
  }

  getRegion() {
    return this.strategy.getRegion();
  }

  /**
   * Set coordinates
   * @param {Point} topLeft Top left corner
   * @param {Point} topRight Top right corner
   * @param {Point} bottomRight Bottom right corner
   * @param {Point} bottomLeft Bottom left corner
   */
  set coordinates({ topLeft, topRight, bottomRight, bottomLeft }) {
    this.#coordinates = [topLeft, topRight, bottomRight, bottomLeft];
    this.#isPointInsideStrategy?.prepareStrategy();
  }

  /**
   * Get coordinates
   * @returns {Point[]} Polygon coordinates
   */
  get coordinates() {
    return this.#coordinates;
  }

  /**
   * Polygon strategy.
   * @param {PointInsideStrategy} strategy Strategy
   */
  set strategy(strategy) {
    strategy.polygon = this;
    this.#isPointInsideStrategy = strategy;
  }

  /**
   * Polygon strategy.
   * @type {PointInsideStrategy}
   */
  get strategy() {
    return this.#isPointInsideStrategy;
  }
}
