import mongoose, { Schema, Document } from "mongoose";

export interface IComplaint extends Document {
  type: string;
  location: string;
  description: string;
  urgencyLevel: "low" | "medium" | "high";
  isAnonymous: boolean;
  name?: string;
  email?: string;
  phone?: string;
  expectedResolution: string;
  images: string[];
  status: "pending" | "in-progress" | "resolved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  userId?: string; // Changed from mongoose.Types.ObjectId to string
}

const ComplaintSchema: Schema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: function(this: IComplaint) {
        return !this.isAnonymous;
      },
    },
    email: {
      type: String,
      required: function(this: IComplaint) {
        return !this.isAnonymous;
      },
    },
    phone: {
      type: String,
      required: false,
    },
    expectedResolution: {
      type: String,
      default: "3-5 days",
    },
    images: [{
      type: String,
    }],
    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved", "rejected"],
      default: "pending",
    },
    userId: {
      type: String, // Changed from mongoose.Schema.Types.ObjectId to String
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IComplaint>("Complaint", ComplaintSchema);