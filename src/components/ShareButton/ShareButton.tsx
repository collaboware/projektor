import React from 'react'

import { useIsMobile } from '../../hooks/useIsMobile'

interface ShareButtonProps {
  url: string
  post?: boolean
}

const ShareButton: React.FC<ShareButtonProps> = ({ url, post }) => {
  const isMobile = useIsMobile()
  return (
    <button
      onClick={() => {
        if (isMobile) {
          navigator
            .share({ url })
            .then(() => {
              if (post) {
                alert('Copied a link to your post.')
              } else {
                alert('Copied a link to your profile.')
              }
            })
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
