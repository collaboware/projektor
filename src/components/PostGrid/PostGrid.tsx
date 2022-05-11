import React, { useState } from "react";

import { PostShape } from "../../shex/generated";
import Post from "../Post/Post";

import styles from "./PostGrid.module.scss";

interface PostGridProps {
  posts: PostShape[];
}

const PostGrid: React.FC<PostGridProps> = ({ posts }) => {
  const [selectedPost, setSelectedPost] = useState<PostShape | null>(null);
  return (
    <>
      {selectedPost && (
        <div className={styles.selectedPostWrapper}>
          <button
            className={styles.closeSelectedPostButton}
            onClick={(e) => {
              e.preventDefault();
              setSelectedPost(null);
            }}
          >
            Close
          </button>
          <div
            className={styles.selectedPost}
            style={{
              background: `url(${selectedPost.link})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          />
        </div>
      )}
      <div
        className={styles.postGrid}
        style={{ overflowY: selectedPost ? "hidden" : "scroll" }}
      >
        {posts.map((post) => (
          <Post post={post} onSelect={() => setSelectedPost(post)} />
        ))}
      </div>
    </>
  );
};

export default PostGrid;
