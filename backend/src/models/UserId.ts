import { model, PopulatedDoc, Schema } from 'mongoose'
import { IUser } from './User'
import { Types } from 'mongoose'

interface IUseridNo extends Document {
    id: Number
    
  }

  const UseridNo= new Schema({
     id :{type:Number,default:10000},
  })
const useridno = model<typeof UseridNo>('useridno', UseridNo)

export { UseridNo, useridno }