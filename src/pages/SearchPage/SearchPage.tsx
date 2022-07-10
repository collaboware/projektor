import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'

import Page from '../../components/Page/Page'
import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import { solidProfile, SolidProfileShape } from '../../generated/shex'

import {
  IdentityProviderUrls,
  IdentityProviderUrlsWithSubdomainScheme,
} from './identityProviders'
import styles from './SearchPage.module.scss'

const SearchPage: React.FC = () => {
  const { term } = useParams<{ term: string }>()
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [foundMatches, setFoundMatches] = useState<
    | {
        user: SolidProfileShape
        provider: string
      }[]
    | string
  >([])
  const [currentSearch, setCurrentSearch] = useState<ReturnType<
    typeof setTimeout
  > | null>(null)

  useEffect(() => {
    setIsLoading(true)
    const newMatches: { user: SolidProfileShape; provider: string }[] = []
    let possibleUserWebId: string
    if (term?.startsWith('https://')) {
      setCurrentSearch(
        setTimeout(() => {
          solidProfile
            .findOne({
              where: { id: possibleUserWebId },
              doc: possibleUserWebId,
            })
            .then((profile) => {
              if (profile.data) {
                setFoundMatches([
                  {
                    user: profile.data,
                    provider: new URL(possibleUserWebId).host,
                  },
                ])
              }
            })
        }, 1000)
      )
    }
    if (currentSession) {
      solidProfile.fetcher._fetch = currentSession?.fetch
      if (currentSearch) {
        clearTimeout(currentSearch)
      }
      setCurrentSearch(
        setTimeout(() => {
          const possibleUserWebIds = [
            ...Object.values(IdentityProviderUrls).map((idp) => {
              return `https://${idp}/${term}/profile/card#me`
            }),
            ...Object.values(IdentityProviderUrlsWithSubdomainScheme).map(
              (idp) => {
                return `https://${term}.${idp}/profile/card#me`
              }
            ),
          ]
          Promise.all(
            possibleUserWebIds.map((possibleUserWebId) => {
              return solidProfile
                .findOne({
                  where: { id: possibleUserWebId },
                  doc: possibleUserWebId,
                })
                .then((profile) => {
                  console.debug(profile)
                  if (profile.data) {
                    newMatches.push({
                      user: profile.data,
                      provider: new URL(possibleUserWebId).host,
                    })
                  }
                })
                .catch(console.warn)
            })
          ).then(() => {
            if (newMatches.length) {
              setFoundMatches(newMatches)
            } else {
              setFoundMatches(`No results for ${term}.`)
            }
            setIsLoading(false)
          })
        }, 1000)
      )
    }
  }, [term])

  return (
    <Page title={`Searching for ${term}`}>
      {isLoading ? <h2>Loading...</h2> : null}
      {typeof foundMatches === 'string' && !isLoading && (
        <h2>{foundMatches}</h2>
      )}
      {typeof foundMatches !== 'string' &&
        foundMatches.map((match) => {
          return (
            <div className={styles.results} key={match.user.id}>
              <Link to={`/user/${encodeURIComponent(match.user.id)}`}>
                <h1>{match.user.name}</h1>
              </Link>
              <h2 className={styles.provider}>@{match.provider}</h2>
            </div>
          )
        })}
    </Page>
  )
}

export default SearchPage
