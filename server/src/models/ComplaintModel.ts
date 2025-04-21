import mongoose, { Schema, Document } from 'mongoose';

export interface IComment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
}

export interface IComplaint extends Document {
    type: string;
    location: string;
    description: string;
    urgencyLevel: "low" | "medium" | "high";
    isAnonymous: boolean;
    name?: string;
    email?: string;
    images: string[];
    status: "pending" | "in-progress" | "resolved" | "rejected";
    createdAt: string;
    updatedAt: string;
    userId?: string;
    likes: string[];
    comments: IComment[];
}

const CommentSchema: Schema = new Schema<IComment>({
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, required: true },
});

const ComplaintSchema: Schema = new Schema<IComplaint>({
    type: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    urgencyLevel: { type: String, enum: ["low", "medium", "high"], required: true },
    isAnonymous: { type: Boolean, required: true },
    name: { type: String },
    email: { type: String },
    images: { type: [String], default: [] },
    status: { type: String, enum: ["pending", "in-progress", "resolved", "rejected"], default: "pending" },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    userId: { type: String },
    likes: { type: [String], default: [] },
    comments: { type: [CommentSchema], default: [] },
});

export default mongoose.models.Complaint || mongoose.model<IComplaint>('Complaint', ComplaintSchema);