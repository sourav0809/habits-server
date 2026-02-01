import mongoose, { Document, Schema } from "mongoose";

/**
 * UserActivity document (daily activity summary per user).
 * Ref: user_activities.userId > users._id
 */
export interface IUserActivity extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  totalCalories: number;
  totalWaterMl: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userActivitySchema = new Schema<IUserActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
    },
    totalCalories: {
      type: Number,
      required: true,
      default: 0,
    },
    totalWaterMl: {
      type: Number,
      required: true,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "user_activities",
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

userActivitySchema.index({ userId: 1, deletedAt: 1 });
userActivitySchema.index({ userId: 1, date: 1, deletedAt: 1 });

const UserActivityModel = mongoose.model<IUserActivity>("UserActivity", userActivitySchema);

export default UserActivityModel;
