import mongoose, { Document, Schema } from "mongoose";

import { USER_STATUS } from "@/constant";

/**
 * User document interface (MongoDB document + Mongoose methods).
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  email: string;
  name: string;
  password: string;
  status: (typeof USER_STATUS)[keyof typeof USER_STATUS];
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new user (service layer).
 */
export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

/**
 * Input for updating a user (service layer).
 */
export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
}

/**
 * User schema definition.
 * Indexes: unique email, status + deletedAt for queries.
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Do not return password by default
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
  }
);

userSchema.virtual("id").get(function (this: IUser) {
  return this._id.toString();
});
userSchema.index({ status: 1, deletedAt: 1 });
userSchema.index({ email: 1, status: 1, deletedAt: 1 });

const UserModel = mongoose.model<IUser>("User", userSchema);

export default UserModel;
