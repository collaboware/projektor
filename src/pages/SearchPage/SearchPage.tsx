import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Link } from 'react-router-dom'

import { getProfileAndStorageUrl } from '../../App'
import Page from '../../components/Page/Page'
import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'

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
        webId: string
        user: string
        provider: string
      }[]
    | string
  >([])
  const [currentSearch, setCurrentSearch] = useState<ReturnType<
    typeof setTimeout
  > | null>(null)

  console.debug(foundMatches)

  useEffect(() => {
    setIsLoading(true)
    const newMatches: { user: string; webId: string; provider: string }[] = []
    let possibleUserWebId: string

    if (currentSearch) {
      clearTimeout(currentSearch)
    }

    if (term?.startsWith('https://')) {
      setCurrentSearch(
        setTimeout(async () => {
          const [extendedProfile] = await getProfileAndStorageUrl(
            possibleUserWebId
          )
          if (extendedProfile) {
            setFoundMatches([
              {
                user: term,
                webId: extendedProfile,
                provider: new URL(possibleUserWebId).host,
              },
            ])
          }
        }, 1000)
      )
    }

    if (currentSession) {
      setCurrentSearch(
        setTimeout(() => {
          const possibleUserWebIds = [
            ...Object.values(IdentityProviderUrls).map((idp) => {
              return `https://${idp}/${term}`
            }),
            ...Object.values(IdentityProviderUrlsWithSubdomainScheme).map(
              (idp) => {
                return `https://${term}.${idp}/profile/card#me`
              }
            ),
          ]
          Promise.all(
            possibleUserWebIds.map(async (possibleUserWebId) => {
              const [webId] = await getProfileAndStorageUrl(
                possibleUserWebId
              ).catch(() => {
                return []
              })
              if (webId) {
                newMatches.push({
                  user: term as string,
                  webId: webId,
                  provider: new URL(webId).host,
                })
              }
            })
          ).then(() => {
            if (newMatches.length) {
              setFoundMatches(newMatches)
            } else {
              setFoundMatches(`No results for ${term}.`)
            }
            setIsLoading(false)
          })
        }, 2000)
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
            <div className={styles.results} key={match.webId}>
              <Link to={`/user/${encodeURIComponent(match.webId)}`}>
                <h1>{match.user}</h1>
              </Link>
              <h2 className={styles.provider}>@{match.provider}</h2>
            </div>
          )
        })}
    </Page>
  )
}

export default SearchPage
