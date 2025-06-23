import {
  FunctionParameters,
  PointInsideStrategy,
} from "./point-inside-strategy.js";
import { Polygon } from "./polygon.js";

/**
 * Grid of n x m polygons
 */
export class Grid {
  /**
   * Polygons making the upper row.
   * @type {Polygon[]}
   */
  #topPolygons = [];

  /**
   * Polygons making the upper row.
   * @type {Polygon[]}
   */
  #bottomPolygons = [];

  /**
   * Polygons making the upper row.
   * @type {Polygon[]}
   */
  #leftPolygons = [];

  /**
   * Polygons making the upper row.
   * @type {Polygon[]}
   */
  #rightPolygons = [];

  /**
   * Polygon describing the whole area.
   * @type {Polygon}
   */
  #areaPolygon;

  /**
   * Vertical subdivisions.
   * @type {number}
   */
  #verticalSubdivisions;

  /**
   * Horizontal subdivisions.
   * @type {number}
   */
  #horizontalSubdivisions;

  /**
   * @param {number} verticalSubdivisions Number of vertical subdivisions
   * @param {number} horizontalSubdivisions Number of horizontal subdivisions
   */
  constructor(verticalSubdivisions, horizontalSubdivisions) {
    this.#verticalSubdivisions = verticalSubdivisions;
    this.#horizontalSubdivisions = horizontalSubdivisions;
    this.#initGrid(verticalSubdivisions, horizontalSubdivisions);
  }

  get coordinates() {
    return this.#areaPolygon.coordinates;
  }

  set coordinates(coordinates) {
    this.#areaPolygon.coordinates = coordinates;
    this.#initSubAreas(
      this.#verticalSubdivisions,
      this.#horizontalSubdivisions
    );
  }

  isPointInside(point) {
    return this.#areaPolygon.isPointInside(point);
  }

  getRegions() {
    return {
      main: this.#areaPolygon.getRegion(),
      top: this.#topPolygons.map((polygon) => polygon.getRegion()),
      bottom: this.#bottomPolygons.map((polygon) => polygon.getRegion()),
      left: this.#leftPolygons.map((polygon) => polygon.getRegion()),
      right: this.#rightPolygons.map((polygon) => polygon.getRegion()),
    };
  }

  #initGrid(verticalSubdivisions, horizontalSubdivisions) {
    this.#initMainArea();
    this.#initSubAreas(verticalSubdivisions, horizontalSubdivisions);
  }

  #initMainArea() {
    this.#areaPolygon = new Polygon();
    this.#areaPolygon.strategy = new PointInsideStrategy();
  }

  #initSubAreas(verticalSubdivisions, horizontalSubdivisions) {
    const params = this.#areaPolygon.strategy.params;
    const horizontalCenter = this.#calculateCenterCoordinates(
      params[0],
      params[3]
    );
    const verticalCenter = this.#calculateCenterCoordinates(
      params[1],
      params[2]
    );
    this.#topPolygons = this.#initHorizontalSubAreas(
      this.#areaPolygon.coordinates[0],
      this.#areaPolygon.coordinates[1],
      verticalCenter.end,
      verticalCenter.start,
      horizontalSubdivisions
    );
    this.#bottomPolygons = this.#initHorizontalSubAreas(
      verticalCenter.start,
      verticalCenter.end,
      this.#areaPolygon.coordinates[2],
      this.#areaPolygon.coordinates[3],
      horizontalSubdivisions
    );
    this.#leftPolygons = this.#initVerticalSubAreas(
      this.#areaPolygon.coordinates[0],
      horizontalCenter.start,
      horizontalCenter.end,
      this.#areaPolygon.coordinates[3],
      verticalSubdivisions
    );
    this.#rightPolygons = this.#initVerticalSubAreas(
      horizontalCenter.start,
      this.#areaPolygon.coordinates[1],
      this.#areaPolygon.coordinates[2],
      horizontalCenter.end,
      verticalSubdivisions
    );
  }

  #initHorizontalSubAreas(tL, tR, bR, bL, count) {
    const polygons = [];
    for (let i = 0; i < count; i++) {
      const topLeft = {
        x: tL.x + ((tR.x - tL.x) / count) * i,
        y: tL.y + ((tR.y - tL.y) / count) * i,
      };
      const topRight = {
        x: tL.x + ((tR.x - tL.x) / count) * (i + 1),
        y: tL.y + ((tR.y - tL.y) / count) * (i + 1),
      };
      const bottomRight = {
        x: bL.x + ((bR.x - bL.x) / count) * (i + 1),
        y: bL.y + ((bR.y - bL.y) / count) * (i + 1),
      };
      const bottomLeft = {
        x: bL.x + ((bR.x - bL.x) / count) * i,
        y: bL.y + ((bR.y - bL.y) / count) * i,
      };
      const polygon = new Polygon();
      polygon.coordinates = { topLeft, topRight, bottomRight, bottomLeft };
      polygon.strategy = new PointInsideStrategy();
      polygons.push(polygon);
    }
    return polygons;
  }

  #initVerticalSubAreas(tL, tR, bR, bL, count) {
    const polygons = [];
    for (let i = 0; i < count; i++) {
      const topLeft = {
        x: tL.x + ((bL.x - tL.x) / count) * i,
        y: tL.y + ((bL.y - tL.y) / count) * i,
      };
      const topRight = {
        x: tR.x + ((bR.x - tR.x) / count) * i,
        y: tR.y + ((bR.y - tR.y) / count) * i,
      };
      const bottomRight = {
        x: tR.x + ((bR.x - tR.x) / count) * (i + 1),
        y: tR.y + ((bR.y - tR.y) / count) * (i + 1),
      };
      const bottomLeft = {
        x: tL.x + ((bL.x - tL.x) / count) * (i + 1),
        y: tL.y + ((bL.y - tL.y) / count) * (i + 1),
      };
      const polygon = new Polygon();
      polygon.coordinates = { topLeft, topRight, bottomRight, bottomLeft };
      polygon.strategy = new PointInsideStrategy();
      polygons.push(polygon);
    }
    return polygons;
  }

  /**
   * Calculate coordinates for center axis
   * @param {FunctionParameters} aParams Params of first side
   * @param {FunctionParameters} bParams Params of second side
   */
  #calculateCenterCoordinates(aParams, bParams) {
    const start = {
      x: 0,
      y: 0,
    };
    const end = {
      x: 0,
      y: 0,
    };

    if (aParams.isVertical) {
      start.x = aParams.yValue;
      start.y = (aParams.a.y + aParams.b.y) / 2;
    } else {
      start.x = (aParams.a.x + aParams.b.x) / 2;
      start.y = aParams.base + aParams.slope * start.x;
    }

    if (bParams.isVertical) {
      end.x = bParams.yValue;
      end.y = (bParams.a.y + bParams.b.y) / 2;
    } else {
      end.x = (bParams.a.x + bParams.b.x) / 2;
      end.y = bParams.base + bParams.slope * end.x;
    }

    return { start, end };
  }
}
