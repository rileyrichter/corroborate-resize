const Jimp = require("jimp");
const fs = require("fs-extra");
const request = require("request");
const path = require("path");
const env = require("dotenv").config();

// replace with your TinyPNG API key
const TINYPNG_API_KEY = process.env.TINYPNG_API_KEY;

async function resizeAndCompressImages() {
  const folderPath = "./events/thumbnail/resized"; // replace with your folder path
  const files = await fs.readdir(folderPath);

  for (let file of files) {
    const filePath = path.join(folderPath, file);
    try {
      if (path.extname(filePath).match(/.jpg|.jpeg|.png/)) {
        const image = await Jimp.read(filePath);
        const { width } = image.bitmap;

        if (width > 1500) {
          image.resize(1500, Jimp.AUTO);
          await image.writeAsync(filePath);
          console.log(`Image ${file} has been resized.`);
        }

        if (fs.statSync(filePath).size > 250 * 1024) {
          await compressImage(filePath, file);
        }
      }
    } catch (error) {
      console.log(`Error processing image ${file}: ${error.message}`);
    }
  }
}

function compressImage(filePath, fileName) {
  return new Promise((resolve, reject) => {
    const req = request.post(
      "https://api.tinify.com/shrink",
      {
        headers: {
          Authorization:
            "Basic " + Buffer.from("api:" + TINYPNG_API_KEY).toString("base64"),
        },
        body: fs.createReadStream(filePath),
      },
      (error, response, body) => {
        if (error) {
          reject(
            new Error(`Error compressing image ${fileName}: ${error.message}`)
          );
        } else if (response.statusCode !== 201) {
          reject(
            new Error(
              `Error compressing image ${fileName}: ${JSON.parse(body).message}`
            )
          );
        } else {
          const resultUrl = JSON.parse(body).output.url;
          request
            .get(resultUrl)
            .pipe(fs.createWriteStream(filePath))
            .on("finish", resolve);
          console.log(`Image ${fileName} has been compressed.`);
        }
      }
    );
  });
}

resizeAndCompressImages().catch(console.error);
