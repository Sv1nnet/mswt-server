import path from 'path'

export const getTargetAndUserDir = (exercise, userId) => {
  const userDir = path.join((global as typeof globalThis).appRoot, 'uploads', userId)
  const targetDir = path.join(userDir, exercise._id.toString())
  return {
    userDir,
    targetDir,
  }
}