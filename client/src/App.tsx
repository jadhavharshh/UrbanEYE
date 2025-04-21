import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import Home from './pages/Home/Home'
import Dashboard from './pages/Dashboard/Dashboard'

import Error from './pages/Error/Error'
import LoginPage from './pages/Auth/Auth'
import Settings from './pages/Settings/Settings'
import LoadingLoop from './components/ui/LoadingLoop'
import { apiClient } from './lib/api-client'
import { FETCH_USER_INFO } from './utils/constants'
import useStore from './store/store'
import { JSX } from 'react'
import Profile from './pages/Profile/Profile'
import Complaints from './pages/Complaints/Complaints'
import CreateComplaints from './pages/CreateComplaints/CreateComplaints'
import ViewComplaints from './pages/ViewComplaints/ViewComplaints'
import MyComplaints from './pages/MyComplaints/MyComplaints'
import Social from './pages/Social/Social'
import Chat from './pages/Chat/Chat'


// Ensure to replace or import your apiClient and FETCH_USER_INFO endpoint.
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return <LoadingLoop />
  }

  if (!user?.id) {
    return <Navigate to="/auth" />
  }
  
  return children
}

const AuthRoute = ({ children }: { children: JSX.Element }) => {
  const { isLoaded, user } = useUser()

  if (!isLoaded) {
    return <LoadingLoop />
  }

  if (user?.id) {
    return <Navigate to="/dashboard" />
  }
  
  return children
}

// New TeacherRoute to protect teacher-specific pages.
const TeacherRoute = ({ children }: { children: JSX.Element }) => {
  const userData = useStore((state) => state.userData)
  // Check if the role of the current user is teacher.
  if (userData?.role !== "teacher") {
     return <Navigate to="/dashboard" />
  }
  return children
}

function App() {  
  const { isLoaded, user } = useUser()
  const setUserData = useStore((state) => state.setUserData)

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          console.log("FETCH_USER_INFO FRONTEND CALL DONE")
          const response = await apiClient.get(FETCH_USER_INFO, { params: { userId: user.id } })
          console.log("Backend data:", response.data)
          // Update Zustand store with fetched data
          setUserData(response.data)
        } catch (error) {
          console.error("Error calling backend:", error)
        }
      }
    }

    if (isLoaded) {
      fetchUserData()
    }
  }, [isLoaded, user, setUserData])

  if (!isLoaded) {
    return <LoadingLoop />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path="/auth" element={<AuthRoute><LoginPage /></AuthRoute>}/>
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}/>
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>}/>
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>}/>
        <Route path="/Complaints" element={<PrivateRoute><Complaints /></PrivateRoute>}/>
        <Route path="/create-complaints" element={<PrivateRoute><CreateComplaints /></PrivateRoute>}/>
        <Route path="/view-complaints" element={<PrivateRoute><ViewComplaints /></PrivateRoute>}/>
        <Route path="/my-complaints" element={<PrivateRoute><MyComplaints /></PrivateRoute>}/>
        <Route path="/social-page" element={<PrivateRoute><Social /></PrivateRoute>}/>
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>}/>
        <Route path="/404" element={<Error />} />0
        <Route path='*' element={<Navigate to="/404" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
