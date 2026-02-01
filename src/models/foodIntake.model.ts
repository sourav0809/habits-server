import mongoose, { Document, Schema } from "mongoose";

/**
 * FoodIntake document (food consumed in a given activity/day).
 * Ref: food_intake.userActivityId > user_activities._id, food_intake.userFoodId > user_foods._id
 */
export interface IFoodIntake extends Document {
  _id: mongoose.Types.ObjectId;
  userActivityId: mongoose.Types.ObjectId;
  userFoodId: mongoose.Types.ObjectId;
  quantity: number;
  totalCalories: number;
  deletedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const foodIntakeSchema = new Schema<IFoodIntake>(
  {
    userActivityId: {
      type: Schema.Types.ObjectId,
      ref: "UserActivity",
      required: true,
      index: true,
    },
    userFoodId: {
      type: Schema.Types.ObjectId,
      ref: "UserFood",
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCalories: {
      type: Number,
      required: true,
      min: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "food_intake",
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

foodIntakeSchema.index({ userActivityId: 1, deletedAt: 1, isDeleted: 1 });
foodIntakeSchema.index({ userFoodId: 1, deletedAt: 1, isDeleted: 1 });

const FoodIntakeModel = mongoose.model<IFoodIntake>("FoodIntake", foodIntakeSchema);

export default FoodIntakeModel;
