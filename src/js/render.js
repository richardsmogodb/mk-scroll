import { assign, setStyle, forEach } from './utilities';
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
      scrollBarWidth,
      map: { size, padding },
    } = this;
    const styles = {
      [size]: `calc(100% + ${scrollBarWidth}px)`,
      [padding]: TRACK_WIDTH + TRACK_GUTTER * 2,
    };

    assign(styles, WRAPPER_STYLES_MAP[direction]);
    setStyle(this.wrapper, styles);
  },
  renderTrack() {
    if (!this.container) return;

    this.track = document.createElement('div');
    const { size, direction } = this.map;
    const styles = {
      [size]: TRACK_WIDTH,
      [direction]: TRACK_GUTTER,
    };

    assign(styles, TRACK_STYLES);
    setStyle(this.track, styles);
    this.container.appendChild(this.track);
  },
  renderThumb() {
    if (!this.track) return;

    this.thumb = document.createElement('div');
    const { size } = this.map;
    const styles = {
      [size]: '100%',
    };

    assign(styles, THUMB_STYLES);
    setStyle(this.thumb, styles);
    this.update();
    this.track.appendChild(this.thumb);
  },
  clean() {
    this.cleanContainer();
    this.cleanWrapper();
    this.cleanTrack();
  },
  cleanContainer() {
    forEach(CONTAINER_STYLES, (value, key) => {
      setStyle(this.container, { [key]: null });
    });
  },
  cleanWrapper() {
    const {
      direction,
      map: { size, padding },
    } = this;
    const styles = {
      [size]: null,
      [padding]: null,
    };

    assign(styles, WRAPPER_STYLES_MAP[direction]);
    forEach(styles, (value, key) => {
      setStyle(this.wrapper, { [key]: null });
    });
  },
  cleanTrack() {
    this.container && this.track && this.container.removeChild(this.track);
  },
};
