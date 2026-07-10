import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

let requested = false;

/**
 * Loads the brand fonts (SIL OFL, bundled in public/fonts). Called from the
 * RemotionRoot component body — a plain side-effect import can be dropped by
 * tree-shaking because package.json declares `sideEffects: ["*.css"]`.
 */
export const ensureBrandFonts = () => {
  if (requested) return;
  requested = true;
  loadFont({
    family: 'Archivo Black',
    url: staticFile('fonts/ArchivoBlack-Regular.ttf'),
    weight: '400',
  }).catch((err) => console.error('Archivo Black failed to load', err));
  loadFont({
    family: 'Space Mono',
    url: staticFile('fonts/SpaceMono-Regular.ttf'),
    weight: '400',
  }).catch((err) => console.error('Space Mono failed to load', err));
};
