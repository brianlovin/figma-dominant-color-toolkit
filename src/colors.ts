const black = { r: 0, b: 0, g: 0 }
const white = { r: 1, b: 1, g: 1 }

export interface RGB {
  r: number;
  g: number;
  b: number;
}

interface Tint {
  rgb: RGB,
  amount: number
}

function tintRGB(props: Tint): RGB {
  let { amount, rgb: { r, g, b }} = props
  
  const getColorTransformation = (number: number): number => (number * (100 + amount)) / 100

  r = getColorTransformation(r);
  g = getColorTransformation(g);
  b = getColorTransformation(b);

  // dont exceed black or white on the hex scale
  r = r < 1 ? r : 1;
  g = g < 1 ? g : 1;
  b = b < 1 ? b : 1;

  return { r, g, b}
}

export function getTextColorsFromRGB(props: RGB): RGB[] {
  const { r, g, b} = props

  let C, L;
  C = [r, g, b];
  C = C.map(i => {
    if (i <= 0.03928) {
      return i / 12.92;
    } else {
      return Math.pow((i + 0.055) / 1.055, 2.4);
    }
  });

  L = 0.2126 * C[0] + 0.7152 * C[1] + 0.0722 * C[2];

  if (L > 0.179) {
    return [ black, tintRGB({ rgb: props, amount: -80 }) ];
  } else {
    return [ white, tintRGB({ rgb: props, amount: 180 }) ];
  }
}
