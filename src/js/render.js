import ResizeObserver from 'resize-observer-polyfill';
import { SCROLL_BAL_WIDTH } from './constants';
import { assign, setStyle } from './utilities';

export default {
  render() {
    this.renderContainer();
    this.renderWrapper();
    console.log(ResizeObserver);
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
        wordBreak: 'break-all',
      });
    } else {
      assign(STYLES, {
        height: this.container.offsetHeight + SCROLL_BAL_WIDTH,
        paddingBottom: SCROLL_BAL_WIDTH,
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
      });
    }

    setStyle(this.wrapper, STYLES);
  },
};
