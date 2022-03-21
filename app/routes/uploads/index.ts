import path from 'path'

const getUploadedImage = (req, res) => {
  const targetPath = path.join(
    (global as typeof globalThis).appRoot,
    'uploads',
    req.params.userId,
    req.params.exerciseId,
    decodeURI(req.params.imageName)
  )
  res.sendFile(targetPath)
}

export default getUploadedImage
