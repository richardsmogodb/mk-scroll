(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.mkScroll = factory());
}(this, function () { 'use strict';

  const VERTICAL = 'vertical';
  const REGEXP_SUFFIX = /^(?:width|height|minWidth|minHeight|top|left|paddingRight|paddingBottom)$/;

  const CONTAINER_MIN_WIDTH = 200;
  const CONTAINER_MIN_HEIGHT = 200;
  const SCROLL_BAL_WIDTH = 17;

  var DEFAULTS = {
    direction: VERTICAL,
    containerMinWidth: CONTAINER_MIN_WIDTH,
    containerMinHeight: CONTAINER_MIN_HEIGHT,
  };

  /**
   * Check if the given value is not a number.
   */
  const isNaN = Number.isNaN || window.isNaN;

  /**
   * Check if the given value is a number.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a number, else `false`.
   */
  const isNumber = value => typeof value === 'number' && !isNaN(value);

  /**
   * Check if the given value is a string.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a string, else `false`.
   */
  const isString = value => typeof value === 'string';

  /**
   * Check if the given value is a function.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a function, else `false`.
   */
  const isFunction = value => typeof value === 'function';

  /**
   * Check if the given value is an object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is an object, else `false`.
   */
  const isObject = value => typeof value === 'object' && value !== null;

  /**
   * Check if the given value is a plain object.
   * @param {*} value - The value to check.
   * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
   */
  const isPlainObject = value => {
    if (!isObject(value)) return false;

    try {
      const { constructor } = value;
      const { prototype } = constructor;

      return (
        constructor &&
        prototype &&
        hasOwnProperty.call(prototype, 'isPrototypeOf')
      );
    } catch (e) {
      return false;
    }
  };

  /**
   * query element by arguments in different length.
   * @param {*} arguments - query arguments[1] under arguments[0] or query arguments[0] under document.
   * @returns {element} Returns element.
   */
  const querySelector = (...args) =>
    args.length > 1
      ? args[0].querySelector(args[1])
      : document.querySelector(args[0]);

  /**
   * Extend the given object.
   * @param {*} obj - The object to be extended.
   * @param {*} args - The rest objects which will be merged to the first object.
   * @returns {Object} The extended object.
   */
  const assign =
    Object.assign ||
    function(obj, ...args) {
      if (isObject(obj) && args.length > 0) {
        args.forEach(arg => {
          if (isObject(arg)) {
            Object.keys(arg).forEach(key => {
              obj[key] = arg[key];
            });
          }
        });
      }

      return obj;
    };

  /**
   * Iterate the given data.
   * @param {*} data - The data to iterate.
   * @param {Function} callback - The process function for each element.
   * @returns {*} The original data.
   */
  const forEach = (data, callback) => {
    if (data && isFunction(callback)) {
      if (Array.isArray(data) || isNumber(data.length)) {
        const { length } = data;

        for (let i = 0; i < length; i++) {
          if (callback.call(data, data[i], i, data) === false) break;
        }
      } else if (isObject(data)) {
        Object.keys(data).forEach(key => {
          callback.call(data, data[key], key, data);
        });
      }
    }

    return data;
  };

  /**
   * Apply styles to the given element.
   * @param {Element} element - The target element.
   * @param {Object} styles - The styles for applying.
   */
  const setStyle = (element, styles) => {
    const { style } = element;

    forEach(styles, (value, key) => {
      if (REGEXP_SUFFIX.test(key) && isNumber(value)) {
        value += 'px';
      }

      style[key] = value;
    });
  };

  var render = {
    render() {
      this.renderContainer();
      this.renderWrapper();
    },
    renderContainer() {
      const STYLES = {
        minWidth: this.options.containerMinWidth,
        minHeight: this.options.containerMinHeight,
        overflow: 'hidden',
      };

      setStyle(this.container, STYLES);
    },
    renderWrapper() {
      const STYLES = {
        boxSizing: 'border-box',
      };

      if (this.isVertical) {
        assign(STYLES, {
          width: this.container.offsetWidth + SCROLL_BAL_WIDTH,
          paddingRight: SCROLL_BAL_WIDTH,
          height: 'inherit',
          overflowX: 'hidden',
          wordBreak: 'break-all'
        });
      } else {
        assign(STYLES, {
          height: this.container.offsetHeight + SCROLL_BAL_WIDTH,
          paddingBottom: SCROLL_BAL_WIDTH,
          overflowY: 'hidden',
          whiteSpace: 'nowrap'
        });
      }
      setStyle(this.wrapper, STYLES);
    },
  };

  class Scroll {
    constructor(element, options = {}) {
      this.container = isString(element) ? querySelector(element) : element;
      if (!this.container) {
        throw new Error('mkScroll require an element or a string.');
      }
      // if (this.container.children.length !== 1) {
      //   throw new Error('the container only require a child.');
      // }
      this.wrapper = this.container.children[0];
      this.options = assign({}, DEFAULTS, isPlainObject(options) && options);
      this.isVertical = this.options.direction === VERTICAL;

      this.init();
    }
    init() {
      this.render();
    }
  }

  assign(Scroll.prototype, render);

  return Scroll;

}));
//# sourceMappingURL=mkScroll.js.map
