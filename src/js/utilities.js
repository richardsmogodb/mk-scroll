import { IN_BROWSER, WINDOW, REGEXP_SUFFIX } from './constants';

/**
 * Check if the given value is not a number.
 */
export const isNaN = Number.isNaN || WINDOW.isNaN;

/**
 * Check if the given value is a number.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a number, else `false`.
 */
export const isNumber = value => typeof value === 'number' && !isNaN(value);

/**
 * Check if the given value is a string.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a string, else `false`.
 */
export const isString = value => typeof value === 'string';

/**
 * Check if the given value is a function.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a function, else `false`.
 */
export const isFunction = value => typeof value === 'function';

/**
 * Check if the given value is an object.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is an object, else `false`.
 */
export const isObject = value => typeof value === 'object' && value !== null;

/**
 * Check if the given value is a plain object.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a plain object, else `false`.
 */
export const isPlainObject = value => {
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
export const querySelector = (...args) =>
  args.length > 1
    ? args[0].querySelector(args[1])
    : document.querySelector(args[0]);

/**
 * Extend the given object.
 * @param {*} obj - The object to be extended.
 * @param {*} args - The rest objects which will be merged to the first object.
 * @returns {Object} The extended object.
 */
export const assign =
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
export const forEach = (data, callback) => {
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
 * Check if the given value is a part of data.
 * @param {*} data - The data to be check.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given value is a part of data, else `false`.
 */
export const includes = (data, value) => {
  const { constructor } = data;
  const { prototype } = constructor;
  let isIncludes = false;

  if (hasOwnProperty.call(prototype, 'includes')) {
    isIncludes = data.includes(value);
  } else if (hasOwnProperty.call(prototype, 'indexOf')) {
    isIncludes = data.indexOf(value) > -1;
  }

  return isIncludes;
};

/**
 * Apply styles to the given element.
 * @param {Element} element - The target element.
 * @param {Object} styles - The styles for applying.
 */
export const setStyle = (element, styles) => {
  const { style } = element;

  forEach(styles, (value, key) => {
    if (REGEXP_SUFFIX.test(key) && isNumber(value)) {
      value += 'px';
    }

    style[key] = value;
  });
};

/**
 * Add classes to the given element.
 * @param {Element} element - The target element.
 * @param {string} value - The classes to be added.
 */
export const addClass = (element, value) => {
  if (!value) return;

  if (isNumber(element.length)) {
    forEach(element, _element => {
      addClass(_element, value);
    });

    return;
  }

  if (element.classList) {
    element.classList.add(value);

    return;
  }

  const className = element.className.trim();

  if (!className) {
    element.className = value;
  } else if (includes(className, value)) {
    element.className += ` ${value}`;
  }
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
export const addListener = (element, type, listener, options = {}) => {
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
export const removeListener = (element, type, listener, options = {}) => {
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
