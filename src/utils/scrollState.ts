interface ScrollState {
  scrollY: number
}

const scrollState: Record<string, { scrollY: number }> = {}

export const saveScrollState = (page: string, state: ScrollState) => {
  scrollState[page] = state
}

export const getScrollState = (page: string) => {
  return scrollState[page]
}
