import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'

import Page from '../../components/Page/Page'
import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import { solidProfile, SolidProfileShape } from '../../generated/shex'

import { IdentityProviderUrls } from './identityProviders'
import styles from './SearchPage.module.scss'

const SearchPage: React.FC = () => {
  const { term } = useParams<{ term: string }>()
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [foundMatches, setFoundMatches] = useState<
    {
      user: SolidProfileShape
      provider: string
    }[]
  >([])
  const [currentSearch, setCurrentSearch] = useState<ReturnType<
    typeof setTimeout
  > | null>(null)

  useEffect(() => {
    setIsLoading(true)
    const newMatches: { user: SolidProfileShape; provider: string }[] = []
    let possibleUserWebId: string
    if (term?.startsWith('https://')) {
      possibleUserWebId = term
    }
    if (currentSession) {
      solidProfile.fetcher._fetch = currentSession?.fetch
      if (currentSearch) {
        clearTimeout(currentSearch)
      }
      setCurrentSearch(
        setTimeout(() => {
          Promise.all(
            Object.values(IdentityProviderUrls).map((idp) => {
              if (!term?.startsWith('https://')) {
                possibleUserWebId = `https://${idp}/${term}/profile/card#me`
              }
              return solidProfile
                .findOne({
                  where: { id: possibleUserWebId },
                  doc: possibleUserWebId,
                })
                .then((profile) => {
                  if (profile.data) {
                    newMatches.push({ user: profile.data, provider: idp })
                  }
                })
            })
          ).then(() => {
            setIsLoading(false)
            setFoundMatches(newMatches)
          })
        }, 1000)
      )
    }
  }, [term])

  return (
    <Page title={`Searching for ${term}`}>
      {isLoading ? <h2>Loading...</h2> : null}
      {foundMatches.map((match) => {
        return (
          <div className={styles.results}>
            <Link to={`/user/${encodeURIComponent(match.user.id)}`}>
              <h1>{match.user.name}</h1>
            </Link>
            <h2>@{match.provider}</h2>
          </div>
        )
      })}
    </Page>
  )
}

export default SearchPage
