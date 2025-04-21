// filepath: /workspaces/UrbanEye/client/src/pages/Chat/Chat.tsx
import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Mail } from "@/Mail/components/mail"
import { apiClient } from "@/lib/api-client"
import { FETCH_CONTACTS } from "@/utils/constants"
import { SocketProvider } from "@/configurations/SocketContext"

export default function Chat() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await apiClient.get(FETCH_CONTACTS)
        setConversations(response.data.conversations || [])
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchConversations()
  }, [])
  
  return (
    <SocketProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 pt-0">
            <div className="hidden flex-col md:flex h-full">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Mail
                  mails={conversations}
                  defaultLayout={[40, 60]}
                />
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SocketProvider>
  )
}