import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Brand fonts, bundled locally (SIL OFL — see public/fonts/OFL-*.txt).
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
