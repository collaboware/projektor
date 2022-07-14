import { Navigate, useLocation } from 'react-router'

import { FeedPage } from './pages/FeedPage/FeedPage'
import LoginPage from './pages/LoginPage/LoginPage'
import PostPage from './pages/PostPage/PostPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import SearchPage from './pages/SearchPage/SearchPage'

const RedirectWithoutAccess: React.FC = () => {
  const location = useLocation()

  return (
    <Navigate
      to="/login"
      state={{ redirectTo: location.pathname + location.search }}
      replace
    />
  )
}

export const routesConfig = (isLoggedIn: boolean, isLoggingIn: boolean) => [
  {
    path: '/',
    element: isLoggedIn ? <FeedPage /> : <RedirectWithoutAccess />,
  },
  {
    path: '/search/:term',
    element: isLoggedIn ? <SearchPage /> : <RedirectWithoutAccess />,
  },
  {
    path: '/login',
    element: <LoginPage isAuthenticating={isLoggingIn} />,
  },
  {
    path: '/user',
    children: [
      {
        path: ':webId',
        element:
          isLoggingIn && !isLoggedIn ? (
            <RedirectWithoutAccess />
          ) : (
            <ProfilePage />
          ),
      },
      {
        path: ':webId/:post',
        element:
          isLoggingIn && !isLoggedIn ? <RedirectWithoutAccess /> : <PostPage />,
      },
    ],
  },
]
