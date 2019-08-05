import { setStyle } from './utilities';
import { VERTICAL, WRAPPER_STYLES_MAP } from './constants';

export default {
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
  destroy() {
    this.unbind();
    this.off();
    this.clean();

    return this;
  },
};
