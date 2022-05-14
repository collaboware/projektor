import React from 'react'
import { useLocation, useNavigate } from 'react-router'
import Page from '../../components/Page/Page'

import styles from './ContactPage.module.scss'

export const ContactPage: React.FC = () => {
    const { session: currentSession } = useContext(CurrentUserAuthContext)
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoading, setIsLoading] = useState(true)

  return (
      <Page title="Post" loading={isLoading} loadingText="Loading...">
    <div>: React.FC</div>
    </Page>
  )
}
