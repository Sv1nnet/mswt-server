// import fs from 'fs'
// import path from 'path'

// type ImageToDelete = {
//   _id: string;
//   user_id: string;

// }

// const deleteImage = (images) => {
//   const userDir = path.join((global as typeof globalThis).appRoot, 'uploads', id)
//   const targetDir = path.join(userDir, exercise._id.toString())
//   let filesInDir = []
    
//   if (!fs.existsSync(userDir)){
//     fs.mkdirSync(userDir);
//     if (!fs.existsSync(targetDir)) {
//       fs.mkdirSync(targetDir);
//     }
//   } else {
//     if (!fs.existsSync(targetDir)) {
//       fs.mkdirSync(targetDir);
//     }
//     filesInDir = fs.readdirSync(targetDir);
//   }
    
//   const targetPath = `${path.join(targetDir, fileName)}`
    
//   exercise.updateImage({ url: `/uploads/${id}/${exercise._id.toString()}/${encodeURI(fileName)}`, })
    
//   const rawData = fs.readFileSync(files.image.filepath)
    
//   fs.writeFile(targetPath, rawData, (err) => {
//     if (err) {
//       throw createRequestError(
//         'Cannot save an image',
//         createResponseError('unableToSaveImage', 400),
//       )
//     } else {
//       filesInDir.forEach(file => fs.unlinkSync(path.join(targetDir, file)))
//     }
//   })
// }