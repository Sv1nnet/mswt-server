import Jimp from "jimp";
import fs from 'fs'

export const MAX_IMAGE_SIDE_SIZE = 320

export const resizeImage = async (rawImage, userDir, targetDir, fileName, files) => {
  let jimpImage = await Jimp.read(rawImage)
  const { width, height } = jimpImage.bitmap;

  if (width > MAX_IMAGE_SIDE_SIZE || height > MAX_IMAGE_SIDE_SIZE) {
    const [isVertical, isHorizontal] = [width < height, width > height]

    let resizedImage = await jimpImage.resize(
      width >= height ? MAX_IMAGE_SIDE_SIZE : Jimp.AUTO,
      height >= width ? MAX_IMAGE_SIDE_SIZE : Jimp.AUTO,
    ).getBufferAsync(`image/${jimpImage.hasAlpha() ? 'png' : 'jpeg'}`)

    jimpImage = await Jimp.read(resizedImage)

    const { width: resizedWidth, height: resizedHeight } = jimpImage.bitmap;
    const [isResizedVertical, isResizedHorizontal] = [resizedWidth < resizedHeight, resizedWidth > resizedHeight]

    if (isResizedVertical !== isVertical || isResizedHorizontal !== isHorizontal) {
      resizedImage = await jimpImage
        .rotate(89)
        .rotate(1)
        .getBufferAsync(`image/${jimpImage.hasAlpha() ? 'png' : 'jpeg'}`)
    }

    files.fileToSave = resizedImage;

    if (!fs.existsSync(userDir)){
      fs.mkdirSync(userDir);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
      }
    } else {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
      }
    }
  }

  if (fs.existsSync(targetDir)) {
    files.filesInDir = fs.readdirSync(targetDir);
  }

  return files;
}