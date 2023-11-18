import { Request, Response } from 'express';
import _ from 'lodash';
import User from 'models/User';
import { IUser } from 'models/User/types';
import Exercise from 'models/Exercise';
import { createRequestError, createResponseError } from 'utils/createResponseError';
import { createResponse } from '@/app/utils/createResponse';
import { pickExercise } from '@/app/utils/pickObjectFromMDBDoc';
import formidable from 'formidable';
import fs from 'fs'
import path from 'path'
import formatFormData from '@/app/utils/formatFormData';
import { nanoid } from 'nanoid'
import getUserOrThrow from '@/app/utils/getUserOrThrow';
import Jimp from 'jimp';
import { resizeImage } from '@/app/utils/resizeImage';
import { saveImage } from '@/app/utils/saveImage';
import { getTargetAndUserDir } from '@/app/utils/getTargetAndUserDir';

type User = {
  id: string;
  access: string;
};

interface RequestWithUser extends Request {
  user: User;
  form: any
}

type Form = {
  image_uid?: string
}

// use after withAccess
const createExercise = async (req: RequestWithUser, res: Response) => {
  const { id } = req.user;

  try {
    const form = formidable()
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.log('form parse error', err)
        throw createRequestError(
          'Cannot save the form',
          createResponseError('unableToParseForm', 400),
        )
      }
      
      let user = await getUserOrThrow(id)

      const { image_uid, ...form } = formatFormData<Form, Form>(fields, { each_side: 'bool', weight: 'number', time: 'number', description: 'string' })

      let exercise

      if (image_uid) {
        const uuid = nanoid()
        const fileName = files.image ? `${uuid}_${files.image.originalFilename}` : ''
  
        exercise = await new Exercise({
          ...form,
          image: {
            uid: image_uid,
            uuid,
            name: files.image.originalFilename,
            url: '',
            uploaded_at: Date.now(),
          }
        })
        
        if (image_uid) {
          const { userDir, targetDir } = getTargetAndUserDir(exercise, id)

          const rawData = fs.readFileSync(files.image.filepath)

          let filesAfterResize = {
            fileToSave: rawData,
            filesInDir: []
          }
          
          try {
            filesAfterResize = await resizeImage(rawData, userDir, targetDir, filesAfterResize)
            saveImage(exercise, id, filesAfterResize, targetDir, fileName)
          } catch (readImgErr) {
            console.log('error in resizing image', readImgErr)
          }
        }
      } else {
        exercise = await new Exercise({ ...form })
      }

      exercise = await exercise.save()

      user.addExercise(exercise)
      user = await user.save()
  
      res.statusCode = 200;
      res.json(createResponse(pickExercise(exercise)));
    })
  } catch (error) {
    console.log('create exercise', error);
    if (error?.name === 'ValidationError') {
      error = createRequestError('Invalid form data', createResponseError('invalidFormData', 400))
    }

    res.statusCode = error.code;
    res.json(createResponse(null, { ...error, message: error?.message || 'Something went wrong' }));
  }
};

export default createExercise;
