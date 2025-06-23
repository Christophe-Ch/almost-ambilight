import { Point } from "./point.js";
import { Polygon } from "./polygon.js";

export class FunctionParameters {
  /**
   * Is function vertical.
   * @type {boolean}
   */
  isVertical;

  /**
   * Y value (vertical function only).
   * @type {number}
   */
  yValue;

  /**
   * Function slope.
   * @type {number}
   */
  slope;

  /**
   * Function value at x=0.
   * @type {number}
   */
  base;

  /**
   * First point of the segment.
   * @type {Point}
   */
  a;

  /**
   * Second point of the segment.
   * @type {Point}
   */
  b;
}

export class PointInsideStrategy {
  /**
   * Polygon
   * @type {Polygon}
   */
  #polygon;

  /**
   * Min X coordinate
   */
  #minX;

  /**
   * Max X coordinate
   */
  #maxX;

  /**
   * Min Y coordinate
   */
  #minY;

  /**
   * Max Y coordinate
   */
  #maxY;

  /**
   * Boundaries for each Y value
   * @type {{min: number, max: number}[]}
   */
  #boundaries = [];

  /**
   * Calculated function parameters;
   * @type {FunctionParameters[]}
   */
  #params = [];

  /**
   * Polygon
   */
  set polygon(polygon) {
    this.#polygon = polygon;
    this.prepareStrategy();
  }

  /**
   * Calculated function parameters.
   * @type {FunctionParameters[]}
   */
  get params() {
    return this.#params;
  }

  /**
   * Calculate whether specified point is inside the polygon
   * @param {Point} point Point to check
   * @returns Whether specified point is inside the polygon
   */
  isPointInside(point) {
    const boundaries = this.#boundaries[point.y];
    return boundaries
      ? boundaries.min <= point.x && point.x <= boundaries.max
      : false;
  }

  getRegion() {
    return this.#boundaries
      .map((boundaries, index) => ({ ...boundaries, y: index }))
      .filter((boundaries) => boundaries.min !== -1 || boundaries.max !== -1);
  }

  /**
   * Prepare for calculations
   */
  prepareStrategy() {
    this.#boundaries = [];
    this.#calculateMinMaxCoordinates();
    this.#params = this.#buildAllFunctionParameters();
    this.#calculateAllBoundaries(this.#params);
  }

  /**
   * Calculate min / max coordinates
   */
  #calculateMinMaxCoordinates() {
    this.#minX = this.#polygon.coordinates.reduce(
      (previous, current) => Math.min(previous, current.x),
      640
    );
    this.#minY = this.#polygon.coordinates.reduce(
      (previous, current) => Math.min(previous, current.y),
      480
    );
    this.#maxX = this.#polygon.coordinates.reduce(
      (previous, current) => Math.max(previous, current.x),
      0
    );
    this.#maxY = this.#polygon.coordinates.reduce(
      (previous, current) => Math.max(previous, current.y),
      0
    );
  }

  /**
   * Build function parameters for segment
   * @param {Point} a First point
   * @param {Point} b Second point
   * @returns {FunctionParameters} Function parameters
   */
  #buildFunctionParameters(a, b) {
    if (a.x - b.x === 0) {
      return {
        isVertical: true,
        yValue: a.x,
        a,
        b,
      };
    }

    const slope = (a.y - b.y) / (a.x - b.x);
    const base = a.y - slope * a.x;
    return { isVertical: false, slope, base, a, b };
  }

  /**
   * Build all function parameters
   * @returns {FunctionParameters[]} Function parameters for all four segments
   */
  #buildAllFunctionParameters() {
    return [
      this.#buildFunctionParameters(
        this.#polygon.coordinates[0],
        this.#polygon.coordinates[1]
      ),
      this.#buildFunctionParameters(
        this.#polygon.coordinates[0],
        this.#polygon.coordinates[3]
      ),
      this.#buildFunctionParameters(
        this.#polygon.coordinates[1],
        this.#polygon.coordinates[2]
      ),
      this.#buildFunctionParameters(
        this.#polygon.coordinates[3],
        this.#polygon.coordinates[2]
      ),
    ];
  }

  /**
   * Calculate boundaries for each Y value
   * @param {FunctionParameters[]} params Function parameters
   */
  #calculateAllBoundaries(params) {
    for (let y = 0; y < 480; y++) {
      this.#boundaries.push(this.#calculateBoundaries(params, y));
    }
  }

  /**
   * Calculate boundaries for specified Y value
   * @param {FunctionParameters[]} params Function parameters
   * @param {number} y Y value
   */
  #calculateBoundaries(params, y) {
    if (y < this.#minY || y > this.#maxY) {
      return {
        min: -1,
        max: -1,
      };
    }
    const results = [];
    for (let parameters of params) {
      if (
        (parameters.a.y < y && parameters.b.y < y) ||
        (parameters.a.y > y && parameters.b.y > y)
      ) {
        continue;
      }

      if (parameters.isVertical && parameters.a.y <= y && parameters.b.y >= y) {
        results.push(parameters.yValue);
      } else if (parameters.slope === 0) {
        if (parameters.base == y) {
          results.push(parameters.a.x, parameters.b.x);
          break;
        }
      } else {
        const result = (y - parameters.base) / parameters.slope;
        if (result >= this.#minX && result <= this.#maxX) {
          results.push(result);
        }
      }
    }

    if (results.length == 0) {
      return {
        min: -1,
        max: -1,
      };
    }
    return {
      min: Math.min(...results),
      max: Math.max(...results),
    };
  }
}
