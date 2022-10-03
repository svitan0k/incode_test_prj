import { Request, Response } from 'express'
import { User } from '../../core/entities/user.entity'
import { createNewUserObj, logIn } from '../helpers/authHelpers'
import { userMongoModel } from '../tools & frameworks/mongo/user.mongo-model'


export const registerUser = async (req: Request, res: Response) => {
    const newUser = await createNewUserObj(req) // error handling is done inside of encapsulating routes error handler in "app.ts", so if this is to fail, that error handler will catch the error

    const foundUser = await userMongoModel.exists({ username: newUser.username }) // this function could also be made into express middleware

    if (foundUser) {
        res.status(409).json({ status: 'failed', reason: 'Username is taken' })
    } else {
        const user = new userMongoModel({
            ...newUser,
        })
        await user.save()

        logIn(req, <string>user.toObject()._id)

        res.status(200).json({
            status: 'success',
            data: {
                ...user.toObject(),
                id: user.toObject()._id,
                password: null,
            },
        })
    }
}
