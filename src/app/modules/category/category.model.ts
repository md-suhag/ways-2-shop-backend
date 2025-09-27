import { model, Schema } from 'mongoose'
import { ICategory, CategoryModel, CategoryStatus } from './category.interface'

const categorySchema = new Schema<ICategory, CategoryModel>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true
    },
    status:{
      type:String,
      enum:Object.values(CategoryStatus),
      default:CategoryStatus.ACTIVE
    }
  },
  { timestamps: true },
)
// Apply to all update operations
categorySchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function (next) {
  this.setOptions({ runValidators: true });
  next();
});
export const Category = model<ICategory, CategoryModel>('Category', categorySchema)