import { Request, Response } from 'express';
import _ from 'lodash';
import formidable from 'formidable';
import Exercise, { ImageModel } from 'models/Exercise';
import { Exercise as TypeExercise, IExercise } from '@/app/models/Exercise/types';
import User from 'models/User';
import { IUser } from 'models/User/types';
import { Document } from 'mongoose';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickExercise } from '@/app/utils/pickObjectFromMDBDoc';
import formatFormData from '@/app/utils/formatFormData';
import { nanoid } from 'nanoid';
import fs from 'fs'
import path from 'path'

type User = {
  id: string;
  access: string;
};

interface IRequestWithUser extends Request {
  user: User;
}

type Form = Partial<IExercise> & {
  image_uid?: string
}

// use after withAccess
const updateExercise = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;
  const { id: exercise_id } = req.params

  try {
    const user: IUser = await User.findOne({ _id: id });
    if (!user.exercises.includes(exercise_id as unknown as Pick<Document, '_id'>)) {
      throw createRequestError(
        "The exercise doesn't exist",
        createResponseError('exerciseNotFound', 404),
      )
    }

    let exercise: IExercise = await Exercise.findOne({ _id: exercise_id });
    if (!exercise) {
      throw createRequestError(
        "The exercise doesn't exist",
        createResponseError('exerciseNotFound', 404),
      )
    }

    const form = formidable()
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log('form parse error', err)
        throw createRequestError(
          'Cannot save the form',
          createResponseError('unableToParseForm', 400),
        )
      }
      
      let user: IUser = await User.findOne({ _id: id });
      if (!user) {
        throw createRequestError(
          'User not found',
          createResponseError('userNotFound', 404),
        )
      }

      const { image_uid, ..._form } = formatFormData<Form, Form>(fields, { each_side: 'bool', weight: 'number', time: 'number', description: 'string' })

      let exercise: IExercise = await Exercise.findOne({ _id: _form.id })
      if (!exercise) {
        throw createRequestError(
          "The exercise doesn't exist",
          createResponseError('exerciseNotFound', 404),
        )
      }

      const form = Object.entries(_form).reduce<{ main: Partial<TypeExercise>, image: any }>((acc, [ key, value ]) => {
        if (/^image_/.test(key)) {
          if (!acc.image) acc.image = {}
          acc.image[key.split('_')[1] || key.split('_')[2]] = value
        } else acc.main[key] = value
        
        return acc
      }, { main: {}, image: null })

      if (form.image) form.main.image = form.image

      const getTargetAndUserDir = () => {
        const userDir = path.join((global as typeof globalThis).appRoot, 'uploads', id)
        const targetDir = path.join(userDir, exercise._id.toString())
        return {
          userDir,
          targetDir,
        }
      }

      if (files.image) {
        const uuid = nanoid()
        const fileName = files.image ? `${uuid}_${files.image.originalFilename}` : ''

        const image = await new ImageModel({
          uid: image_uid,
          uuid,
          name: files.image.originalFilename,
          url: '',
          uploaded_at: Date.now(),
        })
        exercise.updateExercise({ ...form.main as TypeExercise, image })

        if (image_uid) {
          const { userDir, targetDir } = getTargetAndUserDir()
          let filesInDir = []
    
          if (!fs.existsSync(userDir)){
            fs.mkdirSync(userDir);
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir);
            }
          } else {
            if (!fs.existsSync(targetDir)) {
              fs.mkdirSync(targetDir);
            }
            filesInDir = fs.readdirSync(targetDir);
          }
    
          const targetPath = `${path.join(targetDir, fileName)}`
    
          exercise.updateImage({ url: `/uploads/${id}/${exercise._id.toString()}/${encodeURI(fileName)}`, })
    
          const rawData = fs.readFileSync(files.image.filepath)
    
          fs.writeFile(targetPath, rawData, (err) => {
            if (err) {
              throw createRequestError(
                'Cannot save an image',
                createResponseError('unableToSaveImage', 400),
              )
            } else {
              filesInDir.forEach(file => fs.unlinkSync(path.join(targetDir, file)))
            }
          })
        }
      } else {
        form.main.image 
          ? exercise.updateExercise({ ...form.main as TypeExercise, image: exercise.image })
          : (() => {
            console.log('targetDir', getTargetAndUserDir().targetDir)
            exercise.updateExercise({ ...form.main as TypeExercise })
            fs.rmSync(getTargetAndUserDir().targetDir, { recursive: true, force: true })
          })()
      }

      exercise = await exercise.save()
  
      res.statusCode = 200;
      res.json(createResponse(pickExercise(exercise)));
    })
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default updateExercise;
