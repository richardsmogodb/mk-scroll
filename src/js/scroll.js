import DEFAULTS from './defaults';
import { VERTICAL } from './constants';
import render from './render';
import { assign, isString, isPlainObject, querySelector } from './utilities';

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

export default Scroll;
