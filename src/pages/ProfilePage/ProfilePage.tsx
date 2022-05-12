import { Session } from '@inrupt/solid-client-authn-browser'
import { Fetcher, graph } from 'rdflib'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'

import Page from '../../components/Page/Page'
import PostGrid from '../../components/PostGrid/PostGrid'
import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import {
  post,
  postIndex,
  PostShape,
  solidProfile,
  SolidProfileShape,
} from '../../generated/shex'

import styles from './ProfilePage.module.scss'

export const fetchPosts = (session: Session, webId: string) => {
  return new Promise<PostShape[]>(async (resolve) => {
    if (session.info.isLoggedIn) {
      const publicTypeIndexUrl = webId?.replace(
        'profile/card#me',
        `settings/publicTypeIndex.ttl`
      )
      const store = graph()
      const fetcher = new Fetcher(store)
      postIndex.store = store
      postIndex.fetcher = fetcher
      postIndex.fetcher._fetch = session.fetch
      await postIndex
        .findAll({ doc: publicTypeIndexUrl as string })
        .then(async (posts) => {
          const fullPosts = (await Promise.all(
            posts.data?.map(async (postIndex) => {
              return (
                await post.findOne({
                  where: { id: postIndex.link },
                  doc: postIndex.link,
                })
              ).data
            }) ?? []
          )) as PostShape[]
          resolve(fullPosts)
        })
    }
    resolve([])
  })
}

const ProfilePage: React.FC = () => {
  const { session: currentSession } = useContext(CurrentUserAuthContext)
  const [posts, setPosts] = useState<PostShape[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<SolidProfileShape | null>(null)
  const params = useParams<{ webId: string }>()

  useEffect(() => {
    setIsLoading(true)
    const webId = decodeURIComponent(params.webId as string)
    if (currentSession?.info) {
      fetchPosts(currentSession, webId).then((newPosts) => {
        if (currentSession.info.webId !== params.webId) {
          solidProfile.fetcher._fetch = currentSession.fetch
          solidProfile
            .findOne({
              where: { id: webId },
              doc: webId as string,
            })
            .then((profile) => {
              if (profile.data) {
                setUserProfile(profile.data)
              }
            })
        }
        console.debug(newPosts, 'lala')
        setPosts([...newPosts])
        setIsLoading(false)
      })
    }
  }, [currentSession, params.webId])

  const getPostGrid = () => {
    return <PostGrid posts={posts} />
  }

  return (
    <Page
      title={userProfile ? (userProfile.name as string) : 'Profile'}
      loading={isLoading}
      loadingText="Loading Posts..."
    >
      {params.webId === currentSession?.info.webId ? null : (
        <h2 className={styles.header}>
          {userProfile ? userProfile.name : 'Loading User...'}
        </h2>
      )}
      {getPostGrid()}
    </Page>
  )
}

export default ProfilePage
