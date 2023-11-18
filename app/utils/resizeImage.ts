import Jimp from "jimp";
import fs from 'fs'

export const MAX_IMAGE_SIDE_SIZE = 320

export const resizeImage = async (rawImage, userDir, targetDir, files) => {
  const jimpImage = await Jimp.read(rawImage)
  const { width, height } = jimpImage.bitmap;

  if (width > MAX_IMAGE_SIDE_SIZE || height > MAX_IMAGE_SIDE_SIZE) {
    files.fileToSave = await jimpImage.resize(
      width >= height ? MAX_IMAGE_SIDE_SIZE : Jimp.AUTO,
      height >= width ? MAX_IMAGE_SIDE_SIZE : Jimp.AUTO,
    ).getBufferAsync(`image/${jimpImage.hasAlpha() ? 'png' : 'jpeg'}`)

    if (!fs.existsSync(userDir)){
      fs.mkdirSync(userDir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
      }
    } else {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
      }
      files.filesInDir = fs.readdirSync(targetDir);
    }
  }

  return files;
}