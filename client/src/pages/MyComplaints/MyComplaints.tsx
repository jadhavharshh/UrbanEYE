import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  ChevronRight,
  Filter,
  Image,
  Loader2,
  MapPin,
  Plus,
  RefreshCcw,
  Search,
  User,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { GET_COMPLAINTS } from "@/utils/constants";
import { useNavigate } from "react-router-dom";

interface Complaint {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

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

const MyComplaints = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Fetch user's complaints
  useEffect(() => {
    fetchUserComplaints();
  }, [user]);

  // Filter complaints based on search and filters
  useEffect(() => {
    filterComplaints();
  }, [complaints, searchQuery, statusFilter]);

  const fetchUserComplaints = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      // Fetch all complaints
      const response = await apiClient.get(GET_COMPLAINTS);
      
      // Get current user ID from Clerk
      const currentUserId = user.id;
      
      if (!currentUserId) {
        console.error("User ID not available");
        setError("Unable to identify your account. Please try again later.");
        return;
      }
      
      console.log("Current user ID:", currentUserId);
      
      // Filter complaints that match the current user's ID
      const userComplaints = response.data.data.filter(
        (complaint: Complaint) => complaint.userId === currentUserId
      );
      
      console.log("All complaints:", response.data.data);
      console.log("Filtered complaints by user ID:", userComplaints);
      
      // Set the filtered complaints
      setComplaints(userComplaints);
    } catch (error) {
      console.error("Failed to fetch user complaints:", error);
      setError("Failed to fetch your complaints. Please try again.");
      toast.error("Failed to fetch complaints", {
        description: "Could not load your complaint data. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = [...complaints];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (complaint) =>
          complaint.description.toLowerCase().includes(query) ||
          complaint.location.toLowerCase().includes(query) ||
          complaint.type.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((complaint) => complaint.status === statusFilter);
    }

    setFilteredComplaints(filtered);
  };

  const viewComplaintDetails = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const viewImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageOpen(true);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pending";
      case "in-progress": return "In Progress";
      case "resolved": return "Resolved";
      case "rejected": return "Rejected";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
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
                  <BreadcrumbPage>My Complaints</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mb-2 mt-2">
            <h1 className="text-2xl font-semibold tracking-tight">My Complaints</h1>
            <p className="text-sm text-muted-foreground">
              View and track the status of your submitted complaints
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your complaints..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => navigate("/create-complaint")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Complaint
              </Button>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Status</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={fetchUserComplaints}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading your complaints...</p>
            </div>
          ) : error ? (
            <Card className="border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredComplaints.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No complaints found</h3>
                <p className="text-muted-foreground text-center max-w-sm mt-1">
                  {searchQuery || statusFilter !== "all" 
                    ? "Try changing your filters or search query"
                    : "You haven't submitted any complaints yet"}
                </p>
                {!searchQuery && statusFilter === "all" && (
                  <Button 
                    onClick={() => navigate("/create-complaints")}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Your First Complaint
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[120px]">Urgency</TableHead>
                    <TableHead className="w-[180px]">Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow 
                      key={complaint._id}
                      className="cursor-pointer hover:bg-muted/50 group"
                      onClick={() => viewComplaintDetails(complaint)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {complaint.type}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate flex items-center gap-2 group-hover:text-primary">
                          {complaint.description}
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusColors[complaint.status] || ""}
                        >
                          {getStatusText(complaint.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={urgencyColors[complaint.urgencyLevel] || ""}
                        >
                          {complaint.urgencyLevel.charAt(0).toUpperCase() +
                            complaint.urgencyLevel.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(complaint.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Complaint Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Complaint Details</DialogTitle>
            <DialogDescription>
              Submitted on{" "}
              {selectedComplaint && formatDate(selectedComplaint.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedComplaint && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Details */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Badge
                    variant="outline"
                    className={statusColors[selectedComplaint.status] || ""}
                  >
                    {getStatusText(selectedComplaint.status)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={urgencyColors[selectedComplaint.urgencyLevel] || ""}
                  >
                    {selectedComplaint.urgencyLevel.charAt(0).toUpperCase() +
                      selectedComplaint.urgencyLevel.slice(1)} Urgency
                  </Badge>
                  <Badge variant="outline">
                    {selectedComplaint.isAnonymous ? "Anonymous" : "Public"}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Complaint Type
                  </h3>
                  <p className="font-medium">{selectedComplaint.type}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Location
                  </h3>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p>{selectedComplaint.location}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </h3>
                  <div className="p-4 rounded-md bg-muted/30">
                    <p className="whitespace-pre-wrap">{selectedComplaint.description}</p>
                  </div>
                </div>

                {!selectedComplaint.isAnonymous && (
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Name
                          </h4>
                          <p className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {selectedComplaint.name || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Email
                          </h4>
                          <p>{selectedComplaint.email || "Not provided"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">
                            Phone
                          </h4>
                          <p>{selectedComplaint.phone || "Not provided"}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right column - Images and resolution info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Resolution Timeline
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Expected Resolution:</span>
                      <span className="font-medium">{selectedComplaint.expectedResolution}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Last Updated:</span>
                      <span className="font-medium">{formatDate(selectedComplaint.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Current Status:</span>
                      <span className="font-medium">{getStatusText(selectedComplaint.status)}</span>
                    </div>
                  </div>
                </div>

                {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Attached Images
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedComplaint.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square bg-muted rounded-md overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          onClick={() => viewImage(image)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Image className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <img
                            src={`http://localhost:5000${image}`}
                            alt={`Complaint image ${index + 1}`}
                            className="absolute inset-0 h-full w-full object-cover hover:opacity-90 transition-opacity"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDetailsOpen(false)}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Complaint Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-hidden">
            <img
              src={`http://localhost:5000${selectedImage}`}
              alt="Complaint"
              className="max-h-[calc(90vh-8rem)] max-w-full object-contain rounded-md"
            />
          </div>
          <DialogFooter>
            <Button onClick={() => setIsImageOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default MyComplaints;