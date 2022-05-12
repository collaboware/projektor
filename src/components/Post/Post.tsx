import React from 'react'

import { PostShape } from '../../generated/shex'

interface PostProps {
  post: PostShape
  onSelect?: () => void
}

const Post: React.FC<PostProps> = ({ post, onSelect }) => {
  return (
    <div
      key={post.id}
      onClick={() => {
        console.debug(post.id)
        if (onSelect) onSelect()
      }}
      className="post"
      style={{
        cursor: 'pointer',
        background: `url(${post.link})`,
        backgroundSize: 'cover',
      }}
    />
  )
}

export default Post
