import { assign, setStyle } from './utilities';
import {
  CONTAINER_STYLES,
  TRACK_WIDTH,
  TRACK_GUTTER,
  TRACK_STYLES,
  THUMB_STYLES,
  WRAPPER_STYLES_MAP,
} from './constants';

export default {
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
