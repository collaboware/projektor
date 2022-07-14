import React from 'react'

import { useIsMobile } from '../../hooks/useIsMobile'

interface ShareButtonProps {
  title: string
  text?: string
  url: string
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url }) => {
  const isMobile = useIsMobile()
  return (
    <button
      onClick={() => {
        if (isMobile) {
          navigator
            .share({ title, text, url })
            .then(() => alert('Shared your profile.'))
            .catch((err) => alert(err.message))
        } else {
          navigator.clipboard.writeText(url)
          alert('Copied link to clipboard.')
        }
      }}
    >
      Share
    </button>
  )
}

export default ShareButton
