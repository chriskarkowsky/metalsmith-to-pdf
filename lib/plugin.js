'use strict';

const fs = require('fs');
const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');

/**
 * @param {*} - config object
 * @return {function} - the metalsmith plugin
 */

module.exports = function plugin() {
  return async function(files, metalsmith, done) {

    //Open up steam to the PDF output doc
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream('output.pdf'));

    //Open headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    //Create output dir if it doesn't exist
    if (!fs.existsSync('./renders')) await fs.mkdirSync('./renders');

    //Asyns iterate through all the files
    const start = async files => {
      for (const path of Object.keys(files)) {

        //Wrap the content in html tags for consistency 
        let filecontent = `<html><body>${
          files[path].contents
        }</p></body></html>`;
        //Open the content in the browser
        await page.setContent(filecontent);
        await page.pdf({path:`./renders/${path.replace(/\.[^/.]+$/, '')}.pdf`})
        //Take full page screenshot
        /*
        await page.screenshot({
          path: `./renders/${path.replace(/\.[^/.]+$/, '')}.png`,
          fullPage: true,
        });
        
        //Render the screenshot
        await doc.image(`./renders/${path.replace(/\.[^/.]+$/, '')}.png`, {
          fit: [250, 300],
          align: 'center',
          valign: 'center',
        }).addPage();
        await fs.unlinkSync(`./renders/${path.replace(/\.[^/.]+$/, '')}.png`)
        */
      }
    };
    start(files).then(async () => {
      await browser.close();
      console.log('done!');
      doc.end();
      done();
    });
  };
};
