import { useEffect } from 'react'

import { getScrollState, saveScrollState } from '../scrollState'

export const useScrollState = (
  page: string,
  element: HTMLDivElement | null,
  ready = false
) => {
  useEffect(() => {
    const scrollState = getScrollState(page)
    if (getScrollState(page) && ready) {
      const { scrollY } = scrollState
      element?.scrollTo({ top: scrollY })
    }

    const save = () => {
      saveScrollState(page, { scrollY: element?.scrollTop ?? 0 })
    }

    if (ready) {
      save()
      element?.addEventListener('scroll', save)
    }

    return () => element?.removeEventListener('scroll', save)
  }, [ready])
}
