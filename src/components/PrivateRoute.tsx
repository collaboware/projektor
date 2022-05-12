import React, { useContext, useEffect } from 'react'
import { Route, RouteProps, useNavigate } from 'react-router'

import { CurrentUserAuthContext } from '../context/CurrentUserAuthContext'

const PrivateRoute: React.FC<RouteProps> = (props) => {
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const navigate = useNavigate()
  useEffect(() => {
    if (!currentSession) {
      navigate('/login')
    }
  }, [])
  return <Route {...props} />
}

export default PrivateRoute
