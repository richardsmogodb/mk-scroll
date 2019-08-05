import ResizeObserver from 'resize-observer-polyfill';
import {
  RESIZE_LISTENERS,
  RESIZE_OBSERVER,
  EVENT_SCROLL,
  EVENT_MOUSEENTER,
  EVENT_MOUSELEAVE,
  EVENT_MOUSEDOWN,
  EVENT_UNSHIFT,
  EVENT_PUSH,
} from './constants';
import { forEach, isFunction, addListener, removeListener } from './utilities';

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

  if (fn) {
    element[RESIZE_LISTENERS].splice(element[RESIZE_LISTENERS].indexOf(fn), 1);
  } else {
    element[RESIZE_LISTENERS].splice(0);
  }

  if (!element[RESIZE_LISTENERS].length) {
    element[RESIZE_OBSERVER].disconnect();
    element[RESIZE_LISTENERS] = undefined;
  }
};

export default {
  bind() {
    const {
      container,
      wrapper,
      view,
      thumb,
      options: { autoResize },
    } = this;

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
    autoResize &&
      addResizeListener(view, (this.onUpdate = this.update.bind(this)));
  },
  unbind() {
    delete this.scrollable;

    const {
      container,
      wrapper,
      view,
      thumb,
      options: { autoResize },
    } = this;

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

    switch (event) {
      case EVENT_UNSHIFT:
        this.scrollSize = this.wrapper[this.map.scrollSize];

        addListener(
          wrapper,
          EVENT_SCROLL,
          (this.onUnshift = this.unshift.bind(this, callback))
        );
        !this.onUpdate &&
          addResizeListener(view, (this.onUpdate = this.update.bind(this)));
        addResizeListener(
          view,
          (this.onScrollToResize = this.scrollToResize.bind(this))
        );
        break;
      case EVENT_PUSH:
        addListener(
          wrapper,
          EVENT_SCROLL,
          (this.onPush = this.push.bind(this, callback))
        );
        !this.onUpdate &&
          addResizeListener(view, (this.onUpdate = this.update.bind(this)));
        break;
    }
  },
  off(event) {
    delete this.flag;

    const {
      wrapper,
      view,
      options: { autoResize },
    } = this;

    switch (event) {
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
      case undefined:
        removeResizeListener(view);
        break;
    }
  },
};
