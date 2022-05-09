interface AnalyticsLoadedInWindow extends Window {
  fathom: { trackGoal(key: string, value: number): void }
}

export const analyticsWindow = window as unknown as AnalyticsLoadedInWindow
