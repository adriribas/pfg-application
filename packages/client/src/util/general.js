const text = color => `text-${color}`;

const bg = color => `bg-${color}`;

const px = value => `${value}px`;

const percent = value => `${value}%`;

const pt = value => `${value}pt`;

const stop = event => event.stopPropagation();

const prevent = event => event.preventDefault();

const stopPrevent = event => {
  stop(event);
  prevent(event);
};

export default () => ({ text, bg, px, percent, pt, stop, prevent, stopPrevent });
