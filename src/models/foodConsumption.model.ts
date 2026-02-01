import mongoose, { Document, Schema } from "mongoose";

/**
 * FoodConsumption document (food consumed in a given activity/day).
 * Collection: food_consumptions.
 * Ref: food_consumptions.userActivityId > user_activities._id, food_consumptions.userFoodId > user_foods._id
 */
export interface IFoodConsumption extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userActivityId: mongoose.Types.ObjectId;
  userFoodId: mongoose.Types.ObjectId;
  date: Date;
  quantity: number;
  totalCalories: number;
  deletedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const foodConsumptionSchema = new Schema<IFoodConsumption>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
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
    date: {
      type: Date,
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
    collection: "food_consumptions",
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

foodConsumptionSchema.index({ userId: 1, date: 1, deletedAt: 1, isDeleted: 1 });
foodConsumptionSchema.index({ userActivityId: 1, deletedAt: 1, isDeleted: 1 });
foodConsumptionSchema.index({ userFoodId: 1, deletedAt: 1, isDeleted: 1 });

const FoodConsumptionModel = mongoose.model<IFoodConsumption>(
  "FoodConsumption",
  foodConsumptionSchema
);

export default FoodConsumptionModel;
