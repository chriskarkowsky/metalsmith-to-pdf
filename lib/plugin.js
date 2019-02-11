'use strict';

const fs = require('fs');
//const PDFDocument = require('pdfkit');
const puppeteer = require('puppeteer');

/**
 * @param {*} - config object
 * @return {function} - the metalsmith plugin
 */

module.exports = function plugin() {
  return async function(files, metalsmith, done) {
    //Open headless browser
    const browser = await puppeteer.launch();

    //Create output dir if it doesn't exist
    if (!fs.existsSync('./renders')) await fs.mkdirSync('./renders');

    //Process files in parallel
    const start = async files => {
      await Promise.all(Object.keys(files).map(async (path)=>{
          //Wrap the content in html tags for consistency
          const page = await browser.newPage();
          //console.log(files);
          let filecontent = `<html><body>${
            files[path].contents
          }</p></body></html>`;
          //Open the content in the browser
          await page.setContent(filecontent);
          await page.pdf({
            path: `./renders/${path.replace(/\.[^/.]+$/, '')}.pdf`,
          });
          await page.close();
          console.log('pathdone:' + path);
      }))

    };
    start(files).then(async () => {
      await browser.close();
      console.log('done!');
    });
  };
};
