export const IN_BROWSER = typeof window !== 'undefined';
export const WINDOW = IN_BROWSER ? window : {};
export const NAMESPACE = 'mk-scroll';
export const VERTICAL = 'vertical';
export const HORIZONTAL = 'horizontal';
export const RESIZE_LISTENERS = '__resizeListeners__';
export const RESIZE_OBSERVER = '__resizeObserver__';
export const REGEXP_SUFFIX = /^(?:width|height|minWidth|minHeight|top|left|right|bottom|paddingRight|paddingBottom|borderRadius)$/;

export const TRACK_WIDTH = 6;
export const TRACK_GUTTER = 2;

export const THUMB_HOVER_COLOR = 'rgba(144, 147, 153, .5)';
export const THUMB_NO_HOVER_COLOR = 'rgba(144, 147, 153, .3)';

export const EVENT_SCROLL = 'scroll';
export const EVENT_MOUSEENTER = 'mouseenter';
export const EVENT_MOUSELEAVE = 'mouseleave';
export const EVENT_MOUSEDOWN = 'mousedown';
export const EVENT_MOUSEMOVE = 'mousemove';
export const EVENT_MOUSEUP = 'mouseup';
export const EVENT_SELECTSTART = 'onselectstart';

export const EVENT_UNSHIFT = 'unshift';
export const EVENT_PUSH = 'push';

export const CONTAINER_STYLES = {
  position: 'relative',
  minWidth: 200,
  minHeight: 200,
  overflow: 'hidden',
};
export const TRACK_STYLES = {
  position: 'absolute',
  right: TRACK_GUTTER,
  bottom: TRACK_GUTTER,
  zIndex: 1,
  borderRadius: 4,
  opacity: 0,
  transition: 'opacity .12s ease-out',
};
export const THUMB_STYLES = {
  position: 'relative',
  cursor: 'pointer',
  borderRadius: 'inherit',
  backgroundColor: THUMB_NO_HOVER_COLOR,
};
export const WRAPPER_STYLES_MAP = {
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

export const DIRECTION_MAP = {
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
