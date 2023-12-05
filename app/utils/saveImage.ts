import fs from 'fs'
import path from 'path'
import { createRequestError, createResponseError } from './createResponseError'

export const saveImage = (exercise, useId, filesAfterResize, targetDir, fileName) => {
  const targetPath = `${path.join(targetDir, fileName)}`
            
  exercise.updateImage({ url: `/uploads/${useId}/${exercise._id.toString()}/${encodeURI(fileName)}`, })

  fs.mkdirSync(targetDir, { recursive: true })

  let error
  fs.writeFile(targetPath, filesAfterResize.fileToSave, (err) => {
    if (err) {
      error = createRequestError(
        'Cannot save an image',
        createResponseError('unableToSaveImage', 400),
      )
    } else {
      filesAfterResize.filesInDir
        .filter(file => file !== fileName)
        .forEach(file => fs.unlinkSync(path.join(targetDir, file)))
    }
  })

  if (error) throw error
}