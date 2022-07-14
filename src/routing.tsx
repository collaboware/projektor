import { Navigate, useLocation } from 'react-router'

import { FeedPage } from './pages/FeedPage/FeedPage'
import LoginPage from './pages/LoginPage/LoginPage'
import PostPage from './pages/PostPage/PostPage'
import ProfilePage from './pages/ProfilePage/ProfilePage'
import SearchPage from './pages/SearchPage/SearchPage'

const RedirectToLogin: React.FC = () => {
  const location = useLocation()

  const urlParams = new URLSearchParams(location.search)
  urlParams.delete('posts')

  return (
    <Navigate
      to="/login"
      state={{
        redirectTo: location.pathname + `?${urlParams.toString()}`,
      }}
      replace
    />
  )
}

export const routesConfig = (isLoggedIn: boolean, isLoggingIn: boolean) => [
  {
    path: '/',
    element: isLoggedIn ? <FeedPage /> : <RedirectToLogin />,
  },
  {
    path: '/search/:term',
    element: isLoggedIn ? <SearchPage /> : <RedirectToLogin />,
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
          isLoggingIn && !isLoggedIn ? <RedirectToLogin /> : <ProfilePage />,
      },
      {
        path: ':webId/:post',
        element:
          isLoggingIn && !isLoggedIn ? <RedirectToLogin /> : <PostPage />,
      },
    ],
  },
]
