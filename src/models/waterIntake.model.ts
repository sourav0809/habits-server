import mongoose, { Document, Schema } from "mongoose";

/**
 * WaterIntake document (water logged for a given activity/day).
 * Ref: water_intake.userActivityId > user_activities._id
 */
export interface IWaterIntake extends Document {
  _id: mongoose.Types.ObjectId;
  userActivityId: mongoose.Types.ObjectId;
  amountMl: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const waterIntakeSchema = new Schema<IWaterIntake>(
  {
    userActivityId: {
      type: Schema.Types.ObjectId,
      ref: "UserActivity",
      required: true,
      index: true,
    },
    amountMl: {
      type: Number,
      required: true,
      min: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "water_intake",
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

waterIntakeSchema.index({ userActivityId: 1, deletedAt: 1 });

const WaterIntakeModel = mongoose.model<IWaterIntake>("WaterIntake", waterIntakeSchema);

export default WaterIntakeModel;
