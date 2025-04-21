import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  fullName: string;
  email: string;
  role: 'citizen' | 'admin';
  address?: string;
  phoneNumber?: string;
}

const UserSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['citizen', 'admin'], required: true },
    address: { type: String },
    phoneNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
