import { useState } from "react"
import { useUser } from "@clerk/clerk-react"
import { AppSidebar } from "../../components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb"
import { Separator } from "../../components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "../../components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog"
import {
  SquarePen,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MessageCircle,
  Pencil,
  Trash2,
  Image,
  Eye
} from "lucide-react"
import useStore from "../../store/store"

function Complaints() {
  const { user } = useUser()
  const userData = useStore((state) => state.userData)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  
  // State for photo upload and preview
  const [photoPreview, setPhotoPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // State for complaints
  const [complaints, setComplaints] = useState([
    {
      id: 1,
      title: "Water leakage in building A",
      description: "There's a significant water leak in the corridor of Building A, first floor",
      status: "open",
      date: "2025-03-28T10:30:00Z",
      category: "maintenance",
      location: "Building A, First Floor",
      userId: "user_1",
      photo: null
    },
    {
      id: 2,
      title: "Streetlight malfunction near Block C",
      description: "The streetlights near Block C have been non-functional for the past week",
      status: "in-progress",
      date: "2025-03-25T15:45:00Z",
      category: "infrastructure",
      location: "Block C Street",
      userId: "user_2",
      photo: null
    },
    {
      id: 3,
      title: "Garbage collection missed",
      description: "Garbage hasn't been collected from our area for two consecutive days",
      status: "resolved",
      date: "2025-03-20T09:15:00Z",
      category: "sanitation",
      location: "Residential Area B",
      userId: "user_3",
      photo: null
    }
  ])
  
  // State for form data
  const [newComplaint, setNewComplaint] = useState({
    title: "",
    description: "",
    category: "",
    location: ""
  })
  
  // State for editing
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingComplaint, setEditingComplaint] = useState(null)
  
  // State for preview dialog
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [previewingComplaint, setPreviewingComplaint] = useState(null)

  const getStatusBadge = (status : string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500">Open</Badge>
      case "in-progress":
        return <Badge className="bg-amber-500">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-500">Resolved</Badge>
      case "closed":
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString : string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  
  // Handle photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0]
    if (!file) return
    if (file) {
      setSelectedFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewComplaint(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle category selection
  const handleCategoryChange = (value) => {
    setNewComplaint(prev => ({ ...prev, category: value }))
  }
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Create new complaint object
    const complaintObj = {
      id: Date.now(),
      ...newComplaint,
      status: "open",
      date: new Date().toISOString(),
      userId: user?.id,
      photo: photoPreview
    }
    
    // Add to complaints list
    setComplaints([complaintObj, ...complaints])
    
    // Reset form
    setNewComplaint({
      title: "",
      description: "",
      category: "",
      location: ""
    })
    setSelectedFile(null)
    setPhotoPreview(null)
    
    // Switch to "All Complaints" tab instead of "My Complaints"
    setActiveTab("all")
  }
  
  // Handle edit start
  const handleEditStart = (complaint) => {
    setEditingComplaint({...complaint})
    setIsEditDialogOpen(true)
  }
  
  // Handle edit changes
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditingComplaint(prev => ({ ...prev, [name]: value }))
  }
  
  // Handle edit category change
  const handleEditCategoryChange = (value) => {
    setEditingComplaint(prev => ({ ...prev, category: value }))
  }
  
  // Handle edit photo change
  const handleEditPhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditingComplaint(prev => ({ ...prev, photo: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Handle save edits
  const handleSaveEdit = () => {
    if (editingComplaint) {
      setComplaints(complaints.map(complaint => 
        complaint.id === editingComplaint.id ? editingComplaint : complaint
      ))
    }
    setIsEditDialogOpen(false)
  }
  
  // Handle delete complaint
  const handleDelete = (id) => {
    setComplaints(complaints.filter(complaint => complaint.id !== id))
  }
  
  // Handle preview complaint
  const handlePreview = (complaint  ) => {
    setPreviewingComplaint(complaint)
    setIsPreviewDialogOpen(true)
  }
  
  // Filter complaints based on search and status
  const filteredComplaints = complaints
    .filter(complaint => {
      // Apply search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return complaint.title.toLowerCase().includes(query) ||
               complaint.description.toLowerCase().includes(query) ||
               complaint.location?.toLowerCase().includes(query) ||
               complaint.category?.toLowerCase().includes(query)
      }
      return true
    })
    .filter(complaint => {
      // Apply status filter
      if (statusFilter && statusFilter !== "all") {
        return complaint.status === statusFilter
      }
      return true
    })

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
                  <BreadcrumbLink href="/dashboard">
                    UrbanEYE
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Complaints</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mb-2 mt-2">
            <h1 className="text-2xl font-semibold tracking-tight">Complaints Portal</h1>
            <p className="text-sm text-muted-foreground">
              Submit and track urban complaints and issues.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 w-full max-w-md">
              <TabsTrigger value="all" className="flex-1">
                <ClipboardList className="mr-2 h-4 w-4" />
                All Complaints
              </TabsTrigger>
              <TabsTrigger value="new" className="flex-1">
                <SquarePen className="mr-2 h-4 w-4" />
                Submit New
              </TabsTrigger>
              {/* Removed My Complaints tab */}
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Complaints</CardTitle>
                  <CardDescription>
                    Browse and search through all reported complaints.
                  </CardDescription>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search complaints..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <div className="flex items-center">
                          <Filter className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Filter by status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((complaint) => (
                        <Card key={complaint.id} className="overflow-hidden">
                          <div className="flex justify-between items-start p-4 border-b">
                            <div>
                              <h3 className="font-medium">{complaint.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatDate(complaint.date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(complaint.status)}
                              
                              {/* Add edit and delete functionality to each card */}
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditStart(complaint)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this complaint? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDelete(complaint.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                          <CardContent className="p-4 pt-3">
                            <p className="text-sm">{complaint.description}</p>
                            
                            {/* Show photo if available */}
                            {complaint.photo && (
                              <div className="mt-3 border rounded-md overflow-hidden">
                                <img 
                                  src={complaint.photo} 
                                  alt="Complaint evidence" 
                                  className="w-full h-auto max-h-48 object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Show location if available */}
                            {complaint.location && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground">
                                  <strong>Location:</strong> {complaint.location}
                                </p>
                              </div>
                            )}
                          </CardContent>
                          <CardFooter className="flex justify-between bg-secondary/50 p-3">
                            <Badge variant="outline" className="capitalize">
                              {complaint.category}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handlePreview(complaint)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center p-6 bg-secondary/30 rounded-lg">
                        <p className="text-muted-foreground">No complaints found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredComplaints.length} complaints
                  </div>
                  <Button size="sm" variant="outline" disabled>
                    Load More
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="new" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Submit New Complaint</CardTitle>
                  <CardDescription>
                    Report an issue or submit a complaint about urban infrastructure.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="complaint-form" className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Complaint Title
                      </label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Brief title describing the issue"
                        required
                        value={newComplaint.title}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium">
                        Category
                      </label>
                      <Select value={newComplaint.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="infrastructure">Infrastructure</SelectItem>
                          <SelectItem value="sanitation">Sanitation</SelectItem>
                          <SelectItem value="safety">Safety & Security</SelectItem>
                          <SelectItem value="noise">Noise Complaint</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">
                        Location
                      </label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="Specific location of the issue"
                        required
                        value={newComplaint.location}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">
                        Description
                      </label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Provide detailed information about the issue"
                        required
                        rows={5}
                        value={newComplaint.description}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="photo" className="text-sm font-medium">
                        Attach Photo (Optional)
                      </label>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload images to help illustrate the issue (Max size: 5MB)
                      </p>
                      
                      {/* Preview uploaded photo */}
                      {photoPreview && (
                        <div className="mt-3 border rounded-md overflow-hidden relative">
                          <img 
                            src={photoPreview} 
                            alt="Preview" 
                            className="w-full h-auto max-h-64 object-contain"
                          />
                          <Button 
                            type="button"
                            variant="destructive" 
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              setSelectedFile(null)
                              setPhotoPreview(null)
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t p-4">
                  <Button 
                    variant="outline"
                    type="button"
                    onClick={() => {
                      setNewComplaint({
                        title: "",
                        description: "",
                        category: "",
                        location: ""
                      })
                      setSelectedFile(null)
                      setPhotoPreview(null)
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" form="complaint-form">Submit Complaint</Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Removed My Complaints tab content */}
          </Tabs>
        </div>
      </SidebarInset>
      
      {/* Edit Complaint Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Complaint</DialogTitle>
            <DialogDescription>
              Make changes to your complaint details.
            </DialogDescription>
          </DialogHeader>
          
          {editingComplaint && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium">
                  Complaint Title
                </label>
                <Input
                  id="edit-title"
                  name="title"
                  value={editingComplaint.title}
                  onChange={handleEditChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium">
                  Category
                </label>
                <Select value={editingComplaint.category} onValueChange={handleEditCategoryChange}>
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="sanitation">Sanitation</SelectItem>
                    <SelectItem value="safety">Safety & Security</SelectItem>
                    <SelectItem value="noise">Noise Complaint</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-location" className="text-sm font-medium">
                  Location
                </label>
                <Input
                  id="edit-location"
                  name="location"
                  value={editingComplaint.location || ""}
                  onChange={handleEditChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  name="description"
                  rows={4}
                  value={editingComplaint.description}
                  onChange={handleEditChange}
                />
              </div>
              
              {editingComplaint.photo ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">
                      Attached Photo
                    </label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive h-8 px-2"
                      onClick={() => setEditingComplaint({...editingComplaint, photo: null})}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={editingComplaint.photo} 
                      alt="Complaint evidence" 
                      className="w-full h-auto max-h-48 object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="edit-photo" className="text-sm font-medium">
                    Attach Photo (Optional)
                  </label>
                  <Input
                    id="edit-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleEditPhotoChange}
                  />
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Preview Complaint Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              Detailed view of the selected complaint.
            </DialogDescription>
          </DialogHeader>
          
          {previewingComplaint && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="mt-1">
                    {getStatusBadge(previewingComplaint.status)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date Submitted</h4>
                  <p className="mt-1">{formatDate(previewingComplaint.date)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                  <p className="mt-1 capitalize">{previewingComplaint.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                  <p className="mt-1">{previewingComplaint.location || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Title</h4>
                <p className="mt-1 font-medium">{previewingComplaint.title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="mt-1">{previewingComplaint.description}</p>
              </div>
              
              {previewingComplaint.photo && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Photo Evidence</h4>
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <img 
                      src={previewingComplaint.photo} 
                      alt="Complaint evidence" 
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Progress Timeline</h4>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="bg-blue-500 rounded-full w-3 h-3 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Complaint Submitted</p>
                      <p className="text-xs text-muted-foreground">{formatDate(previewingComplaint.date)}</p>
                    </div>
                  </div>
                  
                  {previewingComplaint.status === "in-progress" && (
                    <div className="flex gap-2">
                      <div className="bg-amber-500 rounded-full w-3 h-3 mt-1" />
                      <div>
                        <p className="text-sm font-medium">Under Review</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(new Date(previewingComplaint.date).getTime() + 86400000))}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {previewingComplaint.status === "resolved" && (
                    <>
                      <div className="flex gap-2">
                        <div className="bg-amber-500 rounded-full w-3 h-3 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Under Review</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(new Date(previewingComplaint.date).getTime() + 86400000))}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-green-500 rounded-full w-3 h-3 mt-1" />
                        <div>
                          <p className="text-sm font-medium">Issue Resolved</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(new Date(new Date(previewingComplaint.date).getTime() + 172800000))}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

export default Complaints