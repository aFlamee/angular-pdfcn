import { getLogoMarkSVG } from "@/src/app/components/logo";

import { LOGO_COLUMNS, LOGO_ROWS } from "./constants";

const FALLBACK = [
  ".XXXXXXXXX.",
  "XXXXXXXXXXX",
  "XX.XXX..XXX",
  "X.X.XX.X.XX",
  "X...XX..XXX",
  "X.X.XX.XXXX",
  "X.X.XX.XXXX",
  "XXXXXXXXXXX",
  "XXXXXXXXXXX",
  ".XXXXXXXXX.",
];

const sampleLogo = async () => {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    getLogoMarkSVG("#000000")
  )}`;
  await image.decode();

  const sample = document.createElement("canvas");
  sample.width = LOGO_COLUMNS;
  sample.height = LOGO_ROWS;

  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return FALLBACK;
  }

  context.drawImage(image, 0, 0, LOGO_COLUMNS, LOGO_ROWS);
  const pixels = context.getImageData(0, 0, LOGO_COLUMNS, LOGO_ROWS).data;

  return Array.from({ length: LOGO_ROWS }, (_rowValue, row) =>
    Array.from({ length: LOGO_COLUMNS }, (_columnValue, column) => {
      const alpha = pixels[(row * LOGO_COLUMNS + column) * 4 + 3];
      return alpha > 48 ? "X" : ".";
    }).join("")
  );
};

export const loadLogoPattern = async () => {
  try {
    const pattern = await sampleLogo();
    const brickCount = pattern.join("").replaceAll(".", "").length;
    return brickCount > 20 ? pattern : FALLBACK;
  } catch {
    return FALLBACK;
  }
};
