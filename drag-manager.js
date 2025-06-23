import { ImageProcessor } from "./image-processor.js";
import { Point } from "./point.js";

const Position = {
  TopLeft: 1,
  TopRight: 2,
  BottomRight: 3,
  BottomLeft: 4,
};

class Handle {
  /**
   * Handle position.
   * @type {Point}
   */
  position;

  /**
   * HTML Element
   * @type {HTMLElement}
   */
  element;
}

export class DragManager {
  /**
   * Top left handle.
   * @type {Handle}
   */
  #tLHandle;

  /**
   * Top right handle.
   * @type {Handle}
   */
  #tRHandle;

  /**
   * Bottom left handle.
   * @type {Handle}
   */
  #bLHandle;

  /**
   * Bottom right handle.
   * @type {Handle}
   */
  #bRHandle;

  /**
   * Handle currently dragged;
   * @type {Handle}
   */
  #draggedHandle;

  /**
   * Image processor instance.
   * @type {ImageProcessor}
   */
  #imageProcessor;

  /**
   * Output element.
   * @type {HTMLElement}
   */
  #outputElement;

  /**
   * Output element DOM Rect.
   * @type {DOMRect}
   */
  outputElementDOMRect;

  /**
   * Function called on mouse move.
   */
  dragHandler = this.#onDrag.bind(this);

  /**
   * Init Drag Manager.
   * @param {ImageProcessor} imageProcessor
   * @param {string} outputElementId
   */
  init(imageProcessor, outputElementId) {
    this.#imageProcessor = imageProcessor;
    this.#outputElement = document.getElementById(outputElementId);
    this.#initHandles();
    document.addEventListener("mouseup", () => {
      this.#stopDrag();
    });
  }

  /**
   * Init area handles.
   */
  #initHandles() {
    this.#tLHandle = {
      position: this.#imageProcessor.area.topLeft,
      element: this.#createHandleElement(this.#imageProcessor.area.topLeft),
    };
    this.#tLHandle.element.addEventListener("mousedown", () => {
      this.#startDrag(this.#tLHandle);
    });

    this.#tRHandle = {
      position: this.#imageProcessor.area.topRight,
      element: this.#createHandleElement(this.#imageProcessor.area.topRight),
    };
    this.#tRHandle.element.addEventListener("mousedown", () => {
      this.#startDrag(this.#tRHandle);
    });

    this.#bRHandle = {
      position: this.#imageProcessor.area.bottomRight,
      element: this.#createHandleElement(this.#imageProcessor.area.bottomRight),
    };
    this.#bRHandle.element.addEventListener("mousedown", () => {
      this.#startDrag(this.#bRHandle);
    });

    this.#bLHandle = {
      position: this.#imageProcessor.area.bottomLeft,
      element: this.#createHandleElement(this.#imageProcessor.area.bottomLeft),
    };
    this.#bLHandle.element.addEventListener("mousedown", () => {
      this.#startDrag(this.#bLHandle);
    });
  }

  /**
   * Build handle HTML element.
   * @param {Point} position Handle position.
   * @returns {HTMLElement} Handle HTML element.
   */
  #createHandleElement(position) {
    const element = document.createElement("div");
    element.classList.add("area-handle");
    element.style.setProperty("--x", position.x + "px");
    element.style.setProperty("--y", position.y + "px");
    this.#outputElement.appendChild(element);
    return element;
  }

  #startDrag(handle) {
    this.#draggedHandle = handle;
    this.outputElementDOMRect = this.#outputElement.getBoundingClientRect();
    document.addEventListener("mousemove", this.dragHandler);
  }

  /**
   * On mouse move.
   * @param {MouseEvent} event Event
   */
  #onDrag(event) {
    const x = Math.min(
      640,
      Math.max(0, event.clientX - this.outputElementDOMRect.x)
    );
    const y = Math.min(
      480,
      Math.max(0, event.clientY - this.outputElementDOMRect.y)
    );
    this.#draggedHandle.element.style.setProperty("--x", x + "px");
    this.#draggedHandle.element.style.setProperty("--y", y + "px");
    this.#draggedHandle.position = {
      x,
      y,
    };
    this.#imageProcessor.area = {
      topLeft: this.#tLHandle.position,
      topRight: this.#tRHandle.position,
      bottomRight: this.#bRHandle.position,
      bottomLeft: this.#bLHandle.position,
    };
  }

  #stopDrag() {
    document.removeEventListener("mousemove", this.dragHandler);
  }
}
