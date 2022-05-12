import { Navigate, useLocation } from 'react-router'

import { FeedPage } from './pages/FeedPage/FeedPage'
import LoginPage from './pages/LoginPage/LoginPage'
import PostPage from './pages/PostPage/PostPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'

const RedirectBeforeLogin: React.FC = () => {
  const location = useLocation()
  console.debug(location.pathname)
  return <Navigate to="/login" state={{ redirectTo: location.pathname }} />
}

export const routesConfig = (isLoggedIn: boolean, isLoggingIn: boolean) => [
  {
    path: '/',
    element: isLoggedIn ? <FeedPage /> : <RedirectBeforeLogin />,
  },
  {
    path: '/search/:term',
    element: isLoggedIn ? <></> : <RedirectBeforeLogin />,
  },
  {
    path: '/login',
    element: <LoginPage isAuthenticating={isLoggingIn} />,
  },
  {
    path: '/user',
    children: [
      {
        path: ':host',
        element: isLoggedIn ? <ProfilePage /> : <RedirectBeforeLogin />,
      },
      {
        path: ':host/:post',
        element: isLoggedIn ? <PostPage /> : <RedirectBeforeLogin />,
      },
    ],
  },
]
