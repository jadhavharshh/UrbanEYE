import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  clerkUserId: string; // added clerkUserId field
  role: 'admin' | 'superadmin';
}

const AdminSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    clerkUserId: { type: String, required: true }, // added field
    role: { type: String, enum: ['admin', 'superadmin'], default: 'admin' },
  },
  { timestamps: true }
);

export default mongoose.model<IAdmin>('Admin', AdminSchema);
