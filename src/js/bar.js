import { setStyle } from './utilities';

/**
 * get the width of scrollbar in different browsers.
 * @returns {Number} Returns the width of scrollbar.
 */
export const getScrollBarWidth = () => {
  const outter = document.createElement('div');
  const innner = document.createElement('div');
  let scrollBarWidth = 0;

  setStyle(outter, {
    position: 'absolute',
    top: -9999,
    width: 100,
    visibility: 'hidden',
    overflow: 'scroll',
  });
  setStyle(innner, {
    width: '100%',
  });
  outter.appendChild(innner);
  document.body.appendChild(outter);
  scrollBarWidth = outter.offsetWidth - innner.offsetWidth;
  outter.parentNode.removeChild(outter);

  return scrollBarWidth;
};
