import mongoose, { Document, Schema } from "mongoose";

/**
 * UserGoal document (user's target for a goal type, e.g. calories, water).
 * Ref: user_goals.userId > users._id
 */
export interface IUserGoal extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: string;
  targetValue: number;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userGoalSchema = new Schema<IUserGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    targetValue: {
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
    collection: "user_goals",
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

userGoalSchema.index({ userId: 1, deletedAt: 1 });
userGoalSchema.index({ userId: 1, type: 1, deletedAt: 1 });

const UserGoalModel = mongoose.model<IUserGoal>("UserGoal", userGoalSchema);

export default UserGoalModel;
