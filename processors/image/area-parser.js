export class AreaParser {
  /**
   * Boundaries for the area.
   * @type {{min: number, max: number, y: number}[]}
   */
  #boundaries = [];

  /**
   * @param {{min: number, max: number, y: number}[]} boundaries Boundaries for the area.
   */
  constructor(boundaries) {
    this.#boundaries = boundaries;
  }

  /**
   * Extract and average pixels based on boundaries.
   * @param {number[]} pixels Pixels (aR, aG, aB, aa, bR, bG, bB, ba, ...)
   * @returns {number[]} RGB average color.
   */
  process(pixels) {
    const r = [];
    const g = [];
    const b = [];
    this.#boundaries.forEach((boundaries) => {
      const start = 640 * 4 * boundaries.y;
      for (let i = Math.floor(boundaries.min); i <= boundaries.max; i++) {
        const index = start + i * 4;
        r.push(pixels[index]);
        g.push(pixels[index + 1]);
        b.push(pixels[index + 2]);
      }
    });
    return {
      r: r.reduce((sum, current) => current + sum, 0) / r.length,
      g: g.reduce((sum, current) => current + sum, 0) / g.length,
      b: b.reduce((sum, current) => current + sum, 0) / b.length,
    };
  }
}
