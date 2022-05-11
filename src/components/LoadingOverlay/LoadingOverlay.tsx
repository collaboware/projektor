import React from "react";

import styles from "./LoadingOverlay.module.scss";

interface LoadingOverlayProps {
  description: string;
  active?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  description,
  active,
}) => {
  // eslint-disable-next-line no-constant-condition
  return active ? (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingText}>{description}</div>
    </div>
  ) : null;
};

export default LoadingOverlay;
