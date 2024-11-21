import path from 'path';
import { fileURLToPath } from 'url';
import { fromPath } from 'pdf2pic';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

// Recreating __dirname in the context of ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async function () {
  try {
    const pdfFilePath = path.resolve(__dirname, 'sample.pdf');

    /**
     * https://www.npmjs.com/package/pdf2pic
     * https://github.com/yakovmeister/pdf2image#readme
     *
     * Following is an overview of the options that can be passed on the pdf2pic methods:
     * quality - set output's image quality
     * format - set output's file format
     * width - set output's width
     * height - set output's height
     * density - controls output's dpi (i am not so sure)
     * savePath - set output's save path
     * saveFilename - set output's file name
     * compression - set output's compression method
     *
     * For detailed information on functioning and effect of each of these options,
     * Visit the GRAPHICSMAGICK Documentation:- http://www.graphicsmagick.org/GraphicsMagick.html
     */
    const pdf2picOptions = {
      quality: 100,
      density: 300,
      format: 'png',
      width: 2000,
      height: 2000,
    };

    const base64Response = await fromPath(pdfFilePath, pdf2picOptions)(
      1, // page number to be converted to image
      true // returns base64 output
    );

    const dataUri = base64Response?.base64;

    if (!dataUri) throw new Error('PDF could not be converted to Base64 string');

    /**
     * https://www.npmjs.com/package/pngjs
     * https://github.com/lukeapage/pngjs
     * Recreate PNG with metadata from extracted Base64 data URI
     */
    const buffer = Buffer.from(dataUri, 'base64');
    const png = PNG.sync.read(buffer);

    /**
     * https://www.npmjs.com/package/jsqr
     * https://github.com/cozmo/jsQR#readme
     * Extract the Code from recreated PNG using jsQR
     */
    const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height);
    const qrCodeText = code?.data;

    if (!qrCodeText) throw new Error('Texto do QR Code não pôde ser extraído da imagem PNG.');

    console.log('Texto do QR Code:==> ', qrCodeText);
  } catch (error) {
    console.error(error);
  }
})();
