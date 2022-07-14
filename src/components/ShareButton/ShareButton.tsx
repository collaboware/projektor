import React from 'react'

interface ShareButtonProps {
  title: string
  text?: string
  url: string
}

const ShareButton: React.FC<ShareButtonProps> = ({ title, text, url }) => {
  return (
    <button
      onClick={() => {
        navigator
          .share({ title, text, url })
          .then(() => alert('Successful share! 🎉'))
          .catch((err) => alert(err.message))
      }}
    >
      Share
    </button>
  )
}

export default ShareButton
