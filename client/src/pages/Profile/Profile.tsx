import { useUser } from '@clerk/clerk-react'
import { format } from 'date-fns'
import useStore from '../../store/store'
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
import { Badge } from "@/components/ui/badge"
import { UserCircle, UserIcon, BadgeIcon, CalendarIcon, ActivityIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

const Profile = () => {
  const { user } = useUser()
  const userData = useStore((state) => state.userData)

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch (error) {
      return 'N/A'
    }
  }

  // Extract first letter of name for avatar fallback
  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'U'
  }

  const getFullName = () => {
    return userData?.data?.fullName || user?.fullName || 'User'
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
                  <BreadcrumbPage>My Profile</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="mb-2 mt-2">
            <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
            <p className="text-sm text-muted-foreground">
              View and manage your profile information.
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4 w-full max-w-md">
              <TabsTrigger value="overview" className="flex-1">
                <UserIcon className="mr-2 h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1">
                <BadgeIcon className="mr-2 h-4 w-4" />
                Personal Details
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">
                <ActivityIcon className="mr-2 h-4 w-4" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Profile Card */}
                <Card>
                  <CardHeader className="text-center">
                    <div className="flex flex-col items-center">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={user?.imageUrl} alt={getFullName()} />
                        <AvatarFallback className="text-xl">{getInitials(getFullName())}</AvatarFallback>
                      </Avatar>
                      <CardTitle className="mt-4">{getFullName()}</CardTitle>
                      <Badge className="mt-2" variant={userData?.data?.role === 'admin' || userData?.role === 'admin' ? "destructive" : "default"}>
                        {userData?.data?.role || userData?.role || 'User'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-center">
                    <p className="text-sm text-muted-foreground">{userData?.data?.email}</p>
                    
                    <div className="flex items-center justify-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Member since {formatDate(userData?.data?.createdAt)}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <div className="space-y-2 w-full">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Profile Completion</span>
                        <span className="font-medium">80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                  </CardFooter>
                </Card>

                {/* Additional Info Cards */}
                <div className="md:col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                      <CardDescription>
                        Your personal information and account details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Full Name</h4>
                          <p className="mt-1">{userData?.data?.fullName}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                          <p className="mt-1">{userData?.data?.email}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">Role</h4>
                          <p className="mt-1 capitalize">{userData?.data?.role || userData?.role}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground">User ID</h4>
                          <p className="mt-1 text-sm truncate font-mono" title={userData?.data?._id}>
                            {userData?.data?._id}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Role Specific Information */}
                  {(userData?.data?.role === 'admin' || userData?.role === 'admin') && (
                    <Card className="border-destructive/20 bg-destructive/5">
                      <CardHeader>
                        <CardTitle className="text-destructive">Admin Access</CardTitle>
                        <CardDescription className="text-destructive/80">
                          You have elevated privileges on this platform.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-destructive/80">
                          As an administrator, you have complete access to manage users, content, and system settings. 
                          Use your privileges responsibly and ensure platform security.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {(userData?.data?.role === 'teacher' || userData?.role === 'teacher') && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardHeader>
                        <CardTitle>Teacher Privileges</CardTitle>
                        <CardDescription>
                          Your educator account has special access.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          As a teacher, you can create and manage courses, track student progress, 
                          and access educational resources. Use these tools to provide the best learning experience.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Detailed information about your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Clerk User ID</h4>
                      <p className="font-mono text-xs">{userData?.data?.clerkUserId}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Database ID</h4>
                      <p className="font-mono text-xs">{userData?.data?._id}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
                      <p>{formatDate(userData?.data?.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                      <p>{formatDate(userData?.data?.updatedAt)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Account Status</h4>
                    <div className="flex items-center space-x-2">
                      <span className="flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                      <span>Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Connected Services</CardTitle>
                  <CardDescription>
                    Accounts and services linked to your profile.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Clerk Authentication</h4>
                          <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                      </div>
                      <Badge>Connected</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between opacity-50">
                      <div className="flex items-center space-x-3">
                        <div className="bg-muted p-2 rounded-full">
                          <UserIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">GitHub</h4>
                          <p className="text-sm text-muted-foreground">Not connected</p>
                        </div>
                      </div>
                      <Badge variant="outline">Connect</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                  <CardDescription>
                    Your platform usage and activity metrics.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                      <h3 className="text-2xl font-bold">0</h3>
                      <p className="text-sm text-muted-foreground">Courses</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                      <h3 className="text-2xl font-bold">0</h3>
                      <p className="text-sm text-muted-foreground">Assignments</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                      <h3 className="text-2xl font-bold">0</h3>
                      <p className="text-sm text-muted-foreground">Messages</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-4 text-center">
                      <h3 className="text-2xl font-bold">0</h3>
                      <p className="text-sm text-muted-foreground">Notifications</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest actions and interactions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-secondary/30 rounded-lg p-4 text-center">
                      <p className="text-muted-foreground">No recent activity to display</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default Profile