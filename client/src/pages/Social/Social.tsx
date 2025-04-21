import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Heart, MapPin, MessageCircle, Send, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { GET_COMPLAINTS } from "@/utils/constants";
import { toast } from "sonner";
import { Complaint, Comment, LikeUpdateEvent, CommentUpdateEvent } from "@/configurations/types";
import { useSocket } from '@/configurations/SocketContext';

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const urgencyColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

export default function Social() {
  const { user } = useUser();
  const { socket } = useSocket(); // Get socket from context
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [isLiking, setIsLiking] = useState<Record<string, boolean>>({});
  const [isCommenting, setIsCommenting] = useState<Record<string, boolean>>({});

  // Socket event listeners with cleanup
  useEffect(() => {
    if (!socket) return;
    
    // Listen for like updates
    socket.on('like-update', (data: LikeUpdateEvent) => {
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint._id === data.complaintId 
            ? { ...complaint, likes: data.likes } 
            : complaint
        )
      );
    });

    // Listen for comment updates
    socket.on('comment-update', (data: CommentUpdateEvent) => {
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint._id === data.complaintId 
            ? { ...complaint, comments: [...(complaint.comments || []), data.comment] } 
            : complaint
        )
      );
    });

    // Clean up listeners when component unmounts
    return () => {
      socket.off('like-update');
      socket.off('comment-update');
    };
  }, [socket]); // Only re-run when socket changes

  // Fetch complaints
  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(GET_COMPLAINTS);
      
      // Add social features if they don't exist in the backend yet
      const complaintsWithSocial = response.data.data.map((complaint: Complaint) => ({
        ...complaint,
        likes: complaint.likes || [],
        comments: complaint.comments || []
      }));
      
      setComplaints(complaintsWithSocial);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      setError("Failed to fetch complaints. Please try again.");
      toast.error("Failed to fetch complaints", {
        description: "Could not load complaint data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (complaintId: string) => {
    // Assumes user is logged in and socket is available
    setIsLiking(prev => ({ ...prev, [complaintId]: true }));
  
    try {
      const complaint = complaints.find(c => c._id === complaintId);
      if (!complaint) return;
  
      const userLiked = complaint.likes.includes(user!.id); // use non-null assertion
      const updatedLikes = userLiked 
        ? complaint.likes.filter(id => id !== user!.id)
        : [...complaint.likes, user!.id];
      
      setComplaints(complaints.map(c => 
        c._id === complaintId ? { ...c, likes: updatedLikes } : c
      ));
      
      socket!.emit("toggle-like", {
        complaintId,
        userId: user!.id,
        action: userLiked ? "unlike" : "like"
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    } finally {
      setIsLiking(prev => ({ ...prev, [complaintId]: false }));
    }
  };
  const handleComment = async (complaintId: string) => {
    const commentText = newComment[complaintId]?.trim();
    if (!commentText) return;
  
    setIsCommenting(prev => ({ ...prev, [complaintId]: true }));
  
    try {
      const newCommentObj: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: user!.id,
        userName: user!.fullName || "User",
        text: commentText,
        createdAt: new Date().toISOString()
      };
  
      setComplaints(complaints.map(c => 
        c._id === complaintId ? { ...c, comments: [...(c.comments || []), newCommentObj] } : c
      ));
  
      setNewComment(prev => ({ ...prev, [complaintId]: "" }));
  
      if (socket) {
        socket.emit("add-comment", {
          complaintId,
          comment: newCommentObj
        });
      } else {
        console.error("Socket connection not available");
        toast.error("Failed to add comment: Socket disconnected");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(prev => ({ ...prev, [complaintId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header section */}
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">UrbanEYE</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Social Feed</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-3xl mx-auto">
          <div className="mb-2 mt-2">
            <h1 className="text-2xl font-semibold tracking-tight">Community Feed</h1>
            <p className="text-sm text-muted-foreground">
              Engage with community complaints and updates
            </p>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading complaints...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Social feed */}
          {!loading && !error && (
            <div className="space-y-6">
              {complaints.map((complaint) => (
                <Card key={complaint._id} className="overflow-hidden">
                  {/* Complaint header with user info */}
                  <CardHeader className="pb-3 space-y-1.5">
                    {/* User info and complaint metadata */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-10 border">
                          {complaint.isAnonymous ? (
                            <AvatarFallback>AN</AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${complaint.name}`} />
                              <AvatarFallback>{complaint.name?.charAt(0) || "U"}</AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {complaint.isAnonymous ? "Anonymous User" : complaint.name || "User"}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(complaint.createdAt)}</span>
                            <span>•</span>
                            <span className="capitalize">{complaint.type}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge variant="outline" className={statusColors[complaint.status]}>
                          {complaint.status.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className={urgencyColors[complaint.urgencyLevel]}>
                          {complaint.urgencyLevel} priority
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Complaint content */}
                  <CardContent className="pb-3">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                          <p className="text-sm">{complaint.location}</p>
                        </div>
                        <p className="text-base leading-relaxed">{complaint.description}</p>
                      </div>

                      {/* Display images if available */}
                      {complaint.images && complaint.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                          {complaint.images.map((image, index) => (
                            <div 
                              key={index}
                              className="relative aspect-square rounded-md overflow-hidden bg-muted"
                            >
                              <img
                                src={`http://localhost:5000${image}`}
                                alt={`Complaint image ${index + 1}`}
                                className="absolute inset-0 h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Like and comment buttons */}
                  <div className="px-6 py-1 flex items-center justify-between border-t">
                    <div className="flex items-center gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={`gap-2 ${complaint.likes.includes(user?.id || '') ? 'text-red-500' : ''}`}
                        onClick={() => handleLike(complaint._id)}
                        disabled={isLiking[complaint._id]}
                      >
                        {isLiking[complaint._id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : complaint.likes.includes(user?.id || '') ? (
                          <Heart className="h-4 w-4 fill-current" />
                        ) : (
                          <Heart className="h-4 w-4" />
                        )}
                        <span>{complaint.likes.length}</span>
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{complaint.comments?.length || 0}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Comments section */}
                  <div className="px-6 pb-4 space-y-4">
                    {/* Comment list */}
                    {complaint.comments && complaint.comments.length > 0 && (
                      <div className="space-y-3 mt-2 max-h-64 overflow-y-auto">
                        {complaint.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="size-8">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.userName}`} />
                              <AvatarFallback>{comment.userName?.charAt(0) || "U"}</AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg py-2 px-3 text-sm flex-1">
                              <div className="font-medium">{comment.userName}</div>
                              <p>{comment.text}</p>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatDate(comment.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Comment input */}
                    <div className="flex items-center gap-3 pt-2">
                      <Avatar className="size-8">
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="relative flex-1">
                        <Input
                          placeholder="Write a comment..."
                          value={newComment[complaint._id] || ""}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [complaint._id]: e.target.value }))}
                          className="pr-10"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(complaint._id);
                            }
                          }}
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => handleComment(complaint._id)}
                          disabled={!newComment[complaint._id] || isCommenting[complaint._id]}
                        >
                          {isCommenting[complaint._id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}