const text = color => `text-${color}`;

const bg = color => `bg-${color}`;

const px = value => `${value}px`;

const percent = value => `${value}%`;

const pt = value => `${value}pt`;

export default () => ({ text, bg, px, percent, pt });
