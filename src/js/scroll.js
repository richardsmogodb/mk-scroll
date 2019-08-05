import DEFAULTS from './defaults';
import render from './render';
import events from './events';
import methods from './methods';
import handlers from './handlers';
import { VERTICAL, HORIZONTAL, DIRECTION_MAP } from './constants';
import { getScrollBarWidth } from './bar';
import { assign, isString, isPlainObject, querySelector } from './utilities';

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

export default Scroll;
