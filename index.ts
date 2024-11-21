import * as path from 'path';
import { fromPath } from "pdf2pic";
import { PNG } from 'pngjs';
import jsQR from 'jsqr';

// Define custom type guards for runtime checks
type ToBase64Response = {
  base64: string;
};

function isToBase64Response(response: unknown): response is ToBase64Response {
  return typeof response === 'object' && response !== null && 'base64' in response;
}

(async () => {
  try {
    const pdfFilePath = path.resolve(__dirname, 'boleto_faad1224-f733-48df-8d49-6622a0c15877.pdf');

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

    const response = await fromPath(pdfFilePath, pdf2picOptions)(
      1,   // Page number to be converted to image
      true // Returns Base64 output
    );

    // Check if response is ToBase64Response
    if (isToBase64Response(response)) {
      const dataUri: string = response.base64;

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

      if (!qrCodeText) throw new Error('QR Code text could not be extracted from the PNG image');

      console.log('QR Code Text:==>', qrCodeText);
    } else {
      throw new Error('Unexpected response type from pdf2pic');
    }
  } catch (error) {
    console.error('Error:', (error as Error).message);
  }
})();