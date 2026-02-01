import mongoose, { Document, Schema } from "mongoose";

/**
 * WaterConsumption document (water logged for a given activity/day).
 * Collection: water_consumptions.
 * Ref: water_consumptions.userActivityId > user_activities._id
 */
export interface IWaterConsumption extends Document {
  _id: mongoose.Types.ObjectId;
  userActivityId: mongoose.Types.ObjectId;
  amountMl: number;
  deletedAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const waterConsumptionSchema = new Schema<IWaterConsumption>(
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
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "water_consumptions",
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

waterConsumptionSchema.index({ userActivityId: 1, deletedAt: 1, isDeleted: 1 });

const WaterConsumptionModel = mongoose.model<IWaterConsumption>(
  "WaterConsumption",
  waterConsumptionSchema
);

export default WaterConsumptionModel;
