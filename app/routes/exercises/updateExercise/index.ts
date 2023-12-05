import { Request, Response } from 'express';
import _ from 'lodash';
import formidable from 'formidable';
import Exercise, { ImageModel } from 'models/Exercise';
import Workout from 'models/Workout';
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
import { IWorkout } from '@/app/models/Workout/types';
import getUserOrThrow from '@/app/utils/getUserOrThrow';
import { resizeImage } from '@/app/utils/resizeImage';
import { saveImage } from '@/app/utils/saveImage';
import { getTargetAndUserDir } from '@/app/utils/getTargetAndUserDir';

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

const MAX_IMAGE_SIZE_50_MB = 52_428_800;

// use after withAccess
const updateExercise = async (req: IRequestWithUser, res: Response) => {
  const { id } = req.user;
  const { id: exercise_id } = req.params

  try {
    let user = await getUserOrThrow(id)
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

    const workouts: IWorkout[] = await Workout.find({ '_id': { $in: user.workouts }})
    const isInWorkout = !!workouts.find((workout) => workout.exercises.find(exercise => exercise_id === exercise.id))

    const form = formidable()

    const parseForm = () => new Promise((resolve, reject) => {
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
          reject(
            createRequestError(
              'User not found',
              createResponseError('userNotFound', 404),
            )
          )
        }
  
        const { image_uid, ..._form } = formatFormData<Form, Form>(fields, { each_side: 'bool', weight: 'number', time: 'number', description: 'string' })
  
        let exercise: IExercise = await Exercise.findOne({ _id: _form.id })
        if (!exercise) {
          reject(
            createRequestError(
              "The exercise doesn't exist",
              createResponseError('exerciseNotFound', 404),
            )
          )
          return
        }
  
        const form = Object.entries(_form).reduce<{ main: Partial<TypeExercise>, image: any }>((acc, [ key, value ]) => {
          if (/^image_/.test(key)) {
            if (!acc.image) acc.image = {}
            acc.image[key.split('_')[1] || key.split('_')[2]] = value
          } else acc.main[key] = value
          
          return acc
        }, { main: {}, image: null })
  
        if (form.image) form.main.image = form.image
  
        if (files.image) {
          if (files.image.size > MAX_IMAGE_SIZE_50_MB) {
            reject(
              createRequestError(
                'Cannot save the form',
                createResponseError('imageToLarge', 413),
              )
            )
            return
          }

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
            const { userDir, targetDir } = getTargetAndUserDir(exercise, id)
            const rawData = fs.readFileSync(files.image.filepath)
  
            let filesAfterResize = {
              fileToSave: rawData,
              filesInDir: []
            }
  
            try {
              filesAfterResize = await resizeImage(rawData, userDir, targetDir, fileName, filesAfterResize)
              saveImage(exercise, id, filesAfterResize, targetDir, fileName)
            } catch (readImgErr) {
              console.log('error in resizing image', readImgErr)
            }
          }
        } else {
          form.main.image 
            ? isInWorkout
              ? exercise.updateExercise({ ...({ title: form.main.title, description: form.main.description } as TypeExercise), image: exercise.image })
              : exercise.updateExercise({ ...form.main as TypeExercise, image: exercise.image })
            : (() => {
              if (isInWorkout) {
                exercise.updateExercise({ ...({ title: form.main.title, description: form.main.description } as TypeExercise) })
              } else {
                exercise.updateExercise({ ...form.main as TypeExercise })
              }
              fs.rmSync(getTargetAndUserDir(exercise, id).targetDir, { recursive: true, force: true })
            })()
        }
  
        exercise = await exercise.save()
    
        res.statusCode = 200;
        res.json(createResponse(pickExercise(exercise)));
      })
    })
    
    await parseForm();
  } catch (error) {
    console.log(error);
    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error.message || 'Something went wrong' }));
  }
};

export default updateExercise;
