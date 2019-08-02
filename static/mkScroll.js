(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('resize-observer-polyfill')) :
  typeof define === 'function' && define.amd ? define(['resize-observer-polyfill'], factory) :
  (global = global || self, global.mkScroll = factory(global.ResizeObserver));
}(this, function (ResizeObserver) { 'use strict';

  ResizeObserver = ResizeObserver && ResizeObserver.hasOwnProperty('default') ? ResizeObserver['default'] : ResizeObserver;

  const IN_BROWSER = typeof window !== 'undefined';
  const WINDOW = IN_BROWSER ? window : {};
  const VERTICAL = 'vertical';
  const HORIZONTAL = 'horizontal';
  const RESIZE_LISTENERS = '__resizeListeners__';
  const RESIZE_OBSERVER = '__resizeObserver__';
  const REGEXP_SUFFIX = /^(?:width|height|minWidth|minHeight|top|left|right|bottom|paddingRight|paddingBottom|borderRadius)$/;

  const TRACK_WIDTH = 6;
  const TRACK_GUTTER = 2;

  const THUMB_HOVER_COLOR = 'rgba(144, 147, 153, .5)';
  const THUMB_NO_HOVER_COLOR = 'rgba(144, 147, 153, .3)';

  const EVENT_SCROLL = 'scroll';
  const EVENT_MOUSEENTER = 'mouseenter';
  const EVENT_MOUSELEAVE = 'mouseleave';
  const EVENT_MOUSEDOWN = 'mousedown';
  const EVENT_MOUSEMOVE = 'mousemove';
  const EVENT_MOUSEUP = 'mouseup';
  const EVENT_SELECTSTART = 'onselectstart';

  const EVENT_UNSHIFT = 'unshift';
  const EVENT_PUSH = 'push';

  const CONTAINER_STYLES = {
    position: 'relative',
    minWidth: 200,
    minHeight: 200,
    overflow: 'hidden',
  };
  const TRACK_STYLES = {
    position: 'absolute',
    right: TRACK_GUTTER,
    bottom: TRACK_GUTTER,
    zIndex: 1,
    borderRadius: 4,
    opacity: 0,
    transition: 'opacity .12s ease-out',
  };
  const THUMB_STYLES = {
    position: 'relative',
    cursor: 'pointer',
    borderRadius: 'inherit',
    backgroundColor: THUMB_NO_HOVER_COLOR,
  };
  const WRAPPER_STYLES_MAP = {
    [VERTICAL]: {
      height: 'inherit',
      overflow: 'hidden scroll',
      wordBreak: 'break-all',
      boxSizing: 'border-box',
    },
    [HORIZONTAL]: {
      width: 'inherit',
      overflow: 'scroll hidden',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    },
  };

  const DIRECTION_MAP = {
    [VERTICAL]: {
      size: 'width',
      padding: 'paddingRight',
      offset: 'offsetWidth',
      clientSize: 'clientHeight',
      direction: 'top',
      scrollSize: 'scrollHeight',
      thumbSize: 'height',
      axis: 'Y',
      client: 'clientY',
      scrollDirection: 'scrollTop',
    },
    [HORIZONTAL]: {
      size: 'height',
      padding: 'paddingBottom',
      offset: 'offsetHeight',
      clientSize: 'clientWidth',
      direction: 'left',
      scrollSize: 'scrollWidth',
      thumbSize: 'width',
      axis: 'X',
      client: 'clientX',
      scrollDirection: 'scrollLeft',
    },
  };

  var DEFAULTS = {
    direction: VERTICAL,
    autoResize: false,
  };

  /**
   * Check if the given value is not a number.
   */
  const isNaN = Number.isNaN || WINDOW.isNaN;

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

  const REGEXP_SPACES = /\s\s*/;
  const onceSupported = (() => {
    let supported = false;

    if (IN_BROWSER) {
      let once = false;
      const listener = () => {};
      const options = Object.defineProperty({}, 'once', {
        get() {
          supported = true;
          return once;
        },
        set(value) {
          once = value;
        },
      });

      WINDOW.addEventListener('test', listener, options);
      WINDOW.removeEventListener('test', listener, options);
    }

    return supported;
  })();

  /**
   * Add event listener to the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */
  const addListener = (element, type, listener, options = {}) => {
    let handler = listener;
    const types = type.trim().split(REGEXP_SPACES);

    forEach(types, event => {
      if (options.once && !onceSupported) {
        const { listeners = {} } = element;

        handler = (...args) => {
          delete listeners[event][listener];
          element.removeEventListener(event, handler, options);
          listener.apply(element, args);
        };

        if (!listeners[event]) {
          listeners[event] = {};
        }

        if (listeners[event][listener]) {
          element.removeEventListener(event, listeners[event][listener], options);
        }

        listeners[event][listener] = handler;
        element.listeners = listeners;
      }

      element.addEventListener(event, handler, options);
    });
  };

  /**
   * Remove event listener from the target element.
   * @param {Element} element - The event target.
   * @param {string} type - The event type(s).
   * @param {Function} listener - The event listener.
   * @param {Object} options - The event options.
   */
  const removeListener = (element, type, listener, options = {}) => {
    let handler = listener;
    const types = type.trim().split(REGEXP_SPACES);

    forEach(types, event => {
      if (!onceSupported) {
        const { listeners } = element;

        if (listeners && listeners[event] && listeners[event][listener]) {
          handler = listeners[event][listener];
          delete listeners[event][listener];

          if (Object.keys(listeners[event]).length === 0) {
            delete listeners[event];
          }

          if (Object.keys(listeners).length === 0) {
            delete element.listeners;
          }
        }
      }

      element.removeEventListener(event, handler, options);
    });
  };

  var render = {
    render() {
      this.renderContainer();
      this.renderWrapper();
      this.renderTrack();
      this.renderThumb();
    },
    renderContainer() {
      setStyle(this.container, CONTAINER_STYLES);
    },
    renderWrapper() {
      const {
        direction,
        container,
        scrollBarWidth,
        map: { size, offset, padding },
      } = this;
      const styles = {
        [size]: container[offset] + scrollBarWidth,
        [padding]: TRACK_WIDTH + TRACK_GUTTER * 2,
      };

      assign(styles, WRAPPER_STYLES_MAP[direction]);
      setStyle(this.wrapper, styles);
    },
    renderTrack() {
      this.track = document.createElement('div');
      const { size, direction } = this.map;
      const styles = {
        [size]: TRACK_WIDTH,
        [direction]: TRACK_GUTTER,
      };

      assign(styles, TRACK_STYLES);
      setStyle(this.track, styles);
      this.container && this.container.appendChild(this.track);
    },
    renderThumb() {
      this.thumb = document.createElement('div');
      const { size } = this.map;
      const styles = {
        [size]: '100%',
      };

      assign(styles, THUMB_STYLES);
      setStyle(this.thumb, styles);
      this.update();
      this.track && this.track.appendChild(this.thumb);
    },
  };

  const resize = entries => {
    for (const entry of entries) {
      const listeners = entry.target[RESIZE_LISTENERS] || [];
      if (listeners.length) {
        forEach(listeners, listener => {
          listener();
        });
      }
    }
  };

  const addResizeListener = (element, fn) => {
    if (!Array.isArray(element[RESIZE_LISTENERS])) {
      element[RESIZE_LISTENERS] = [];
      element[RESIZE_OBSERVER] = new ResizeObserver(resize);
      element[RESIZE_OBSERVER].observe(element);
    }

    isFunction(fn) && element[RESIZE_LISTENERS].push(fn);
  };

  const removeResizeListener = (element, fn) => {
    if (!Array.isArray(element[RESIZE_LISTENERS])) return;

    element[RESIZE_LISTENERS].splice(element[RESIZE_LISTENERS].indexOf(fn), 1);

    if (!element[RESIZE_LISTENERS].length) {
      element[RESIZE_OBSERVER].disconnect();
      element[RESIZE_LISTENERS] = undefined;
    }
  };

  var events = {
    bind() {
      const { container, wrapper, view, thumb, options: { autoResize } } = this;

      this.scrollable = true;

      addListener(
        wrapper,
        EVENT_SCROLL,
        (this.onScrollWrapper = this.scrollWrapper.bind(this))
      );
      addListener(
        container,
        EVENT_MOUSEENTER,
        (this.onMouseEnterContainer = this.mouseEnterContainer.bind(this))
      );
      addListener(
        container,
        EVENT_MOUSELEAVE,
        (this.onMouseLeaveContainer = this.mouseLeaveContainer.bind(this))
      );
      addListener(
        thumb,
        EVENT_MOUSEENTER,
        (this.onMouseEnterThumb = this.mouseEnterThumb.bind(this))
      );
      addListener(
        thumb,
        EVENT_MOUSELEAVE,
        (this.onMouseLeaveThumb = this.mouseLeaveThumb.bind(this))
      );
      addListener(
        thumb,
        EVENT_MOUSEDOWN,
        (this.onMouseDownThumb = this.mouseDownThumb.bind(this))
      );
      autoResize && addResizeListener(view, (this.onUpdate = this.update.bind(this)));
    },
    unbind() {
      delete this.scrollable;

      const { container, wrapper, view, thumb, options: { autoResize } } = this;

      removeListener(wrapper, EVENT_SCROLL, this.onScrollWrapper);
      removeListener(container, EVENT_MOUSEENTER, this.onMouseEnterContainer);
      removeListener(container, EVENT_MOUSELEAVE, this.onMouseLeaveContainer);
      removeListener(thumb, EVENT_MOUSEENTER, this.onMouseEnterThumb);
      removeListener(thumb, EVENT_MOUSELEAVE, this.onMouseLeaveThumb);
      removeListener(thumb, EVENT_MOUSEDOWN, this.onMouseDownThumb);
      autoResize && removeResizeListener(view, this.onUpdate);
    },
    on(event, callback) {
      if (!isFunction(callback)) {
        throw new Error('callback must be a function');
      }
      this.flag = true;

      const { wrapper, view } = this;

      switch(event) {
        case EVENT_UNSHIFT:
          this.scrollSize = this.wrapper[this.map.scrollSize];

          addListener(
            wrapper,
            EVENT_SCROLL,
            (this.onUnshift = this.unshift.bind(this, callback))
          );
          !this.onUpdate && addResizeListener(view, (this.onUpdate = this.update.bind(this)));
          addResizeListener(view, (this.onScrollToResize = this.scrollToResize.bind(this)));
        break;
        case EVENT_PUSH:
          addListener(
            wrapper,
            EVENT_SCROLL,
            (this.onPush = this.push.bind(this, callback))
          );
          !this.onUpdate && addResizeListener(view, (this.onUpdate = this.update.bind(this)));
        break;
      }
    },
    off(event) {
      delete this.flag;

      const { wrapper, view, options: { autoResize } } = this;

      switch(event) {
        case EVENT_UNSHIFT:
          delete this.scrollSize;

          removeListener(wrapper, EVENT_SCROLL, this.onUnshift);
          !autoResize && removeResizeListener(view, this.onUpdate);
          removeResizeListener(view, this.onScrollToResize);
        break;
        case EVENT_PUSH:
          removeListener(wrapper, EVENT_SCROLL, this.onPush);
          !autoResize && removeResizeListener(view, this.onUpdate);
        break;
      }
    },
  };

  var methods = {
    update() {
      if (!this.wrapper) return;

      const {
        thumbMove,
        wrapper,
        map: { clientSize, scrollSize, thumbSize, axis },
      } = this;
      const translate = `translate${axis}(${thumbMove}%)`;
      const percentage = (wrapper[clientSize] * 100) / wrapper[scrollSize];

      this.thumbSize = percentage < 100 ? percentage : 0;
      setStyle(this.thumb, {
        [thumbSize]: `${this.thumbSize}%`,
        transform: translate,
        msTransform: translate,
        webkitTransform: translate,
      });
    },
    scrollTo(distance) {
      const isVertical = this.direction === VERTICAL;
      const x = isVertical ? 0 : distance;
      const y = isVertical ? distance : 0;

      this.wrapper && this.wrapper.scrollTo(x, y);
    },
    scrollToMax() {
      const {
        wrapper,
        map: { clientSize, scrollSize },
      } = this;
      const distance = wrapper[scrollSize] - wrapper[clientSize];

      this.scrollTo(distance);
    },
    scrollToResize() {
      const scrollResize = this.wrapper[this.map.scrollSize];
      const distance = scrollResize - this.scrollSize;
      
      this.scrollTo(distance);
      this.scrollSize = scrollResize;
    },
    disable() {
      const {
        container,
        map: { size, offset },
      } = this;
      const styles = {
        [size]: container[offset],
        overflow: 'hidden',
      };

      setStyle(this.wrapper, styles);
      this.scrollable = false;
    },
    enable() {
      const {
        container,
        direction,
        scrollBarWidth,
        map: { size, offset },
      } = this;
      const { overflow } = WRAPPER_STYLES_MAP[direction];
      const styles = {
        [size]: container[offset] + scrollBarWidth,
        overflow,
      };

      setStyle(this.wrapper, styles);
      this.scrollable = true;
    },
  };

  var handlers = {
    scrollWrapper() {
      if (!this.scrollable) return;

      const {
        wrapper,
        map: { scrollDirection, clientSize },
      } = this;

      this.thumbMove = (wrapper[scrollDirection] * 100) / wrapper[clientSize];
      this.update();
    },
    mouseDownThumb(event) {
      event.stopImmediatePropagation();

      const {
        client,
        direction,
        clientSize,
        scrollDirection,
        scrollSize,
      } = this.map;
      const distance =
        event[client] - event.currentTarget.getBoundingClientRect()[direction];
      const mouseMoveDocument = _event => {
        const percentage = (_event[client] - distance) / this.track[clientSize];

        this.wrapper[scrollDirection] = this.wrapper[scrollSize] * percentage;
        this.scrollWrapper();
      };
      const mouseUpDocument = () => {
        removeListener(document, EVENT_MOUSEMOVE, mouseMoveDocument);
        removeListener(document, EVENT_MOUSEUP, mouseUpDocument);
        document[EVENT_SELECTSTART] = null;
      };

      document[EVENT_SELECTSTART] = () => false;
      addListener(document, EVENT_MOUSEMOVE, mouseMoveDocument);
      addListener(document, EVENT_MOUSEUP, mouseUpDocument);
    },
    mouseEnterContainer() {
      setStyle(this.track, { opacity: 1 });
    },
    mouseLeaveContainer() {
      setStyle(this.track, { opacity: 0 });
    },
    mouseEnterThumb() {
      setStyle(this.thumb, { backgroundColor: THUMB_HOVER_COLOR });
    },
    mouseLeaveThumb() {
      setStyle(this.thumb, { backgroundColor: THUMB_NO_HOVER_COLOR });
    },
    unshift(callback) {
      const active = !this.wrapper[this.map.scrollDirection];

      if (this.flag && active) {
        this.flag = false;
        callback.call(this, () => { this.flag = true; });
      }
    },
    push(callback) {
      const {
        wrapper,
        map: { clientSize, scrollSize, scrollDirection },
      } = this;
      const active = wrapper[scrollDirection] + wrapper[clientSize] === wrapper[scrollSize];

      if (this.flag && active) {
        this.flag = false;
        callback.call(this, () => { this.flag = true; });
      }
    },
  };

  /**
   * get the width of scrollbar in different browsers.
   * @returns {Number} Returns the width of scrollbar.
   */
  const getScrollBarWidth = () => {
    const outter = document.createElement('div');
    const innner = document.createElement('div');
    let scrollBarWidth = 0;

    setStyle(outter, {
      position: 'absolute',
      top: -9999,
      width: 100,
      visibility: 'hidden',
      overflow: 'scroll',
    });
    setStyle(innner, {
      width: '100%',
    });
    outter.appendChild(innner);
    document.body.appendChild(outter);
    scrollBarWidth = outter.offsetWidth - innner.offsetWidth;
    outter.parentNode.removeChild(outter);

    return scrollBarWidth;
  };

  class Scroll {
    constructor(element, options = {}) {
      this.container = isString(element) ? querySelector(element) : element;
      if (!this.container) {
        throw new Error('mkScroll container require an element or a string.');
      }

      this.wrapper = this.container.children[0];
      if (!this.wrapper) {
        throw new Error('mkScroll container require a child element at least.');
      }
      
      this.view = this.wrapper.children[0];
      if (!this.wrapper) {
        throw new Error('mkScroll wrapper require a child element at least.');
      }

      this.scrollBarWidth = getScrollBarWidth();
      if (this.scrollBarWidth <= 0) {
        throw new Error('mkScroll can not resolve the width of scrollbar.');
      }

      this.options = assign({}, DEFAULTS, isPlainObject(options) && options);
      this.direction =
        this.options.direction === VERTICAL ||
        this.options.direction === HORIZONTAL
          ? this.options.direction
          : HORIZONTAL;

      this.init();
    }
    init() {
      this.map = DIRECTION_MAP[this.direction];
      this.thumbSize = 0;
      this.thumbMove = 0;

      this.render();
      this.bind();
    }
  }

  assign(Scroll.prototype, render, events, methods, handlers);

  return Scroll;

}));
//# sourceMappingURL=mkScroll.js.map
