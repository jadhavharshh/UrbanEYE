import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
    AlertCircleIcon,
    CameraIcon,
    FileEditIcon,
    ImageIcon,
    MapPinIcon,
    SendIcon,
    UserIcon,
    CheckCircleIcon
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { CREATE_COMPLAINT } from "@/utils/constants"
import { toast } from "sonner"
import { useUser } from "@clerk/clerk-react"
import useStore from "@/store/store"

const CreateComplaints = () => {
    const { user } = useUser();
    const userData = useStore((state) => state.userData)
    const [isAnonymous, setIsAnonymous] = useState(false)
    const [complaintData, setComplaintData] = useState({
        type: "",
        location: "",
        description: "",
        urgencyLevel: "medium",
        name: "",
        email: "",
        expectedResolution: "3-5 days"
    })
    const [images, setImages] = useState<FileList | null>(null)
    const [useGPS, setUseGPS] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)

    useEffect(() => {
        if (userData) {
            setComplaintData(prev => ({
                ...prev,
                name: userData.data?.fullName || "",
                email: userData.data?.email || ""
            }));
        }
    }, [userData]);


    const handleChange = (field: string, value: string) => {
        setComplaintData({
            ...complaintData,
            [field]: value
        })
    }

   // At the top along with your other state hooks:
const [isAnalyzing, setIsAnalyzing] = useState(false);

// NEW: Function to call the CLIP Flask API and append result to description
const handleAnalyzeImageClip = async () => {
    if (!images || images.length === 0) {
        toast.error("No image uploaded for analysis!");
        return;
    }
    setIsAnalyzing(true);
    try {
        const file = images[0]; // Use the first uploaded image
        const formData = new FormData();
        formData.append("image", file);

        // Call the Flask API on localhost:6000
        const response = await apiClient.post("http://localhost:6000/api/detect-image/", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data && response.data.scenario) {
            // Append the detected scenario to the description field without overwriting existing text
            setComplaintData(prev => ({
                ...prev,
                description: prev.description + (prev.description ? "\n" : "") + " Detected: " + response.data.scenario,
            }));
            toast.success("Image analyzed successfully!");
        } else {
            toast.error("No prediction returned!");
        }
    } catch (err) {
        console.error(err);
        toast.error("Analysis failed!");
    } finally {
        setIsAnalyzing(false);
    }
};
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(e.target.files)
        }
    }

    const handleUseGPS = () => {
        setUseGPS(true)
        // In a real implementation, this would use the browser's geolocation API
        setTimeout(() => {
            handleChange("location", "123 Main Street, City, State")
            setUseGPS(false)
        }, 1000)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            // Create FormData object for multipart/form-data submission
            const formData = new FormData()

            // Add all complaint data fields
            Object.entries(complaintData).forEach(([key, value]) => {
                formData.append(key, value)
            })

            // Add anonymous flag
            formData.append('isAnonymous', isAnonymous.toString())

            // Add user ID from Clerk - THIS IS THE NEW CODE
            if (user) {
                formData.append('userId', user.id);
            }

            // Add images if any
            if (images) {
                Array.from(images).forEach((file) => {
                    formData.append('images', file)
                })
            }

            // Submit to backend using axios via apiClient
            const response = await apiClient.post(CREATE_COMPLAINT, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            console.log("Complaint submitted successfully:", response.data)

            // Update state
            setSubmitSuccess(true)

            // Show success toast
            toast.success("Complaint submitted successfully!", {
                description: "Your complaint has been logged and is being processed."
            })

            // Optional: Reset form or redirect
            // setTimeout(() => {
            //     setComplaintData({
            //         type: "",
            //         location: "",
            //         description: "",
            //         urgencyLevel: "medium",
            //         name: "",
            //         email: "",
            //         phone: "",
            //         expectedResolution: "3-5 days"
            //     })
            //     setImages(null)
            //     setIsAnonymous(false)
            //     // Or redirect: navigate("/dashboard")
            // }, 3000)

        } catch (error: any) {
            console.error("Error submitting complaint:", error)

            // Extract error message from response if available
            let errorMessage = "Failed to submit complaint. Please try again."
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message
            }

            setSubmitError(errorMessage)

            // Show error toast
            toast.error("Submission Failed", {
                description: errorMessage
            })
        } finally {
            setIsSubmitting(false)
        }
    }

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
                                    <BreadcrumbPage>Create Complaint</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="mb-2 mt-2">
                        <h1 className="text-2xl font-semibold tracking-tight">Create Complaint</h1>
                        <p className="text-sm text-muted-foreground">
                            Report an issue in your community for quick resolution.
                        </p>
                    </div>

                    <Tabs defaultValue="create" className="w-full">
                        <TabsList className="mb-4 w-full max-w-md">
                            <TabsTrigger value="create" className="flex-1">
                                <FileEditIcon className="mr-2 h-4 w-4" />
                                Create Complaint
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="flex-1">
                                <SendIcon className="mr-2 h-4 w-4" />
                                Preview & Submit
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="create" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Complaint Details</CardTitle>
                                    <CardDescription>
                                        Provide information about the issue you're reporting.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="complaint-type">Complaint Type</Label>
                                        <Select
                                            value={complaintData.type}
                                            onValueChange={(value) => handleChange("type", value)}
                                        >
                                            <SelectTrigger id="complaint-type">
                                                <SelectValue placeholder="Select type of complaint" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="potholes">Potholes</SelectItem>
                                                <SelectItem value="garbage">Garbage Collection</SelectItem>
                                                <SelectItem value="waterleakage">Water Leakage</SelectItem>
                                                <SelectItem value="streetlights">Streetlights Not Working</SelectItem>
                                                <SelectItem value="construction">Illegal Construction</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                     <div className="space-y-2">
                                 <Label htmlFor="upload-photos">Upload Photos</Label>
    <div className="grid grid-cols-1 gap-4">
        <Button variant="outline" type="button" onClick={handleAnalyzeImageClip} disabled={!images || isAnalyzing}>
            {isAnalyzing ? "Analyzing..." : "Analyze Image"}
        </Button>
        <div className="flex items-center justify-center w-full">
            <label
                htmlFor="upload-photos"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <CameraIcon className="w-8 h-8 mb-3 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                        PNG, JPG or WEBP (MAX. 5MB)
                    </p>
                </div>
                <Input
                    id="upload-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
            </label>
        </div>
        {images && Array.from(images).length > 0 && (
            <div className="flex flex-wrap gap-2">
                {Array.from(images).map((file, index) => (
                    <div key={index} className="relative group">
                        <div className="w-16 h-16 overflow-hidden rounded-md bg-muted">
                            <ImageIcon className="w-full h-full p-2 text-muted-foreground" />
                        </div>
                        <Badge className="absolute -top-2 -right-2 px-1.5">{index + 1}</Badge>
                    </div>
                ))}
            </div>
        )}
    </div>
</div>

                                    <div className="space-y-2">
                                        <Label htmlFor="location">Location</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="location"
                                                placeholder="Address of the issue"
                                                value={complaintData.location}
                                                onChange={(e) => handleChange("location", e.target.value)}
                                                className="flex-1"
                                            />
                                            <Button
                                                variant="outline"
                                                type="button"
                                                onClick={handleUseGPS}
                                                disabled={useGPS}
                                            >
                                                <MapPinIcon className="h-4 w-4 mr-1" />
                                                {useGPS ? "Getting location..." : "Use GPS"}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            placeholder="Please describe the issue in detail"
                                            value={complaintData.description}
                                            onChange={(e) => handleChange("description", e.target.value)}
                                            className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="urgency-level">Urgency Level</Label>
                                        <Select
                                            value={complaintData.urgencyLevel}
                                            onValueChange={(value) => handleChange("urgencyLevel", value)}
                                        >
                                            <SelectTrigger id="urgency-level">
                                                <SelectValue placeholder="Select urgency level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Low Priority</SelectItem>
                                                <SelectItem value="medium">Medium Priority</SelectItem>
                                                <SelectItem value="high">High Priority</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="anonymous-mode">Anonymous Mode</Label>
                                            <p className="text-xs text-muted-foreground">Submit your complaint without revealing your identity.</p>
                                        </div>
                                        <Switch
                                            id="anonymous-mode"
                                            checked={isAnonymous}
                                            onCheckedChange={setIsAnonymous}
                                        />
                                    </div>

                                    {!isAnonymous && (
                                        <div className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Full Name</Label>
                                                    <Input
                                                        disabled={userData ? true : false}
                                                        id="name"
                                                        placeholder="John Doe"
                                                        value={complaintData.name}
                                                        onChange={(e) => handleChange("name", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input
                                                        disabled={userData ? true : false}

                                                        id="email"
                                                        type="email"
                                                        placeholder="john@example.com"
                                                        value={complaintData.email}
                                                        onChange={(e) => handleChange("email", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-end">
                                    <Button onClick={() => (document.querySelector('[data-value="preview"]') as HTMLElement)?.click()}>
                                        Preview Complaint
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>

                        <TabsContent value="preview" className="space-y-4">
                            {submitSuccess && (
                                <div className="rounded-lg border border-green-100 bg-green-50 p-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-green-100 p-2">
                                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-green-800">Submission Successful!</h3>
                                            <p className="text-sm text-green-700">
                                                Your complaint has been successfully submitted and is now being processed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {submitError && (
                                <div className="rounded-lg border border-red-100 bg-red-50 p-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-full bg-red-100 p-2">
                                            <AlertCircleIcon className="h-4 w-4 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-red-800">Submission Failed</h3>
                                            <p className="text-sm text-red-700">{submitError}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Complaint Preview</CardTitle>
                                    <CardDescription>
                                        Review your complaint details before submission.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Complaint Type</h3>
                                            <p className="text-base">{complaintData.type || "Not selected"}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Urgency Level</h3>
                                            <div className="flex items-center gap-2">
                                                <AlertCircleIcon
                                                    className={`h-4 w-4 ${complaintData.urgencyLevel === "high"
                                                        ? "text-red-500"
                                                        : complaintData.urgencyLevel === "medium"
                                                            ? "text-amber-500"
                                                            : "text-green-500"
                                                        }`}
                                                />
                                                <span>
                                                    {complaintData.urgencyLevel === "high"
                                                        ? "High Priority"
                                                        : complaintData.urgencyLevel === "medium"
                                                            ? "Medium Priority"
                                                            : "Low Priority"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                                        <p className="flex items-center gap-1 text-base">
                                            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                                            {complaintData.location || "No location provided"}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                                        <p className="p-3 rounded-md bg-muted/30 text-sm">
                                            {complaintData.description || "No description provided"}
                                        </p>
                                    </div>

                                    {images && Array.from(images).length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Attached Photos ({Array.from(images).length})</h3>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {Array.from(images).map((_, index) => (
                                                    <div key={index} className="w-16 h-16 overflow-hidden rounded-md bg-muted flex items-center justify-center">
                                                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Submission Mode</h3>
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                                            <span>{isAnonymous ? "Anonymous" : "Public"}</span>
                                        </div>
                                    </div>

                                    {!isAnonymous && (
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground">Contact Name</h3>
                                                <p>{complaintData.name || "Not provided"}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground">Contact Email</h3>
                                                <p>{complaintData.email || "Not provided"}</p>
                                            </div>
                                        </div>
                                    )}

                                    <Separator />

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Expected Resolution Time</h3>
                                        <p>{complaintData.expectedResolution}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-muted-foreground">Complaint Status</h3>
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground">Your complaint will be reviewed upon submission</p>
                                            <div className="w-full pt-2">
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                    Pending Submission
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() => (document.querySelector('[data-value="create"]') as HTMLElement)?.click()}
                                        disabled={isSubmitting}
                                    >
                                        Edit Complaint
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || submitSuccess}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                                                Submitting...
                                            </>
                                        ) : submitSuccess ? (
                                            <>
                                                <CheckCircleIcon className="mr-2 h-4 w-4" />
                                                Submitted
                                            </>
                                        ) : (
                                            "Submit Complaint"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default CreateComplaints