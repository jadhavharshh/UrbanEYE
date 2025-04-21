export interface Comment {
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
  }
  
  export interface Complaint {
    _id: string;
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
    // Social features
    likes: string[]; // Array of userIds who liked
    comments: Comment[];
  }
  
  // Socket event payload types
  export interface LikeUpdateEvent {
    complaintId: string;
    likes: string[];
  }
  
  export interface CommentUpdateEvent {
    complaintId: string;
    comment: Comment;
  }