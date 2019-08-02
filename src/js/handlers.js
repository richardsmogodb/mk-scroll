import {
  THUMB_HOVER_COLOR,
  THUMB_NO_HOVER_COLOR,
  EVENT_MOUSEMOVE,
  EVENT_MOUSEUP,
  EVENT_SELECTSTART,
} from './constants';
import { setStyle, addListener, removeListener } from './utilities';

export default {
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
