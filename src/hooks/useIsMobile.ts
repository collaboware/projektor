import { useEffect, useState } from 'react'

import screenSizes from '../constants.scss'

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const set = () => {
      setIsMobile(document.body.clientWidth <= screenSizes.s)
    }

    set()
    window.addEventListener('resize', set)

    return () => window.removeEventListener('resize', set)
  }, [])

  return isMobile
}
