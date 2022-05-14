import { Session } from '@inrupt/solid-client-authn-browser'
import { NamedNode } from 'rdflib'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router'

import FollowButton from '../../components/FollowButton/FollowButton'
import Page from '../../components/Page/Page'
import PostGrid from '../../components/PostGrid/PostGrid'
import UploadButton from '../../components/UploadButton/UploadButton'
import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import {
  post,
  postIndex,
  PostShape,
  solidProfile,
  SolidProfileShape,
} from '../../generated/shex'
import { useIsMobile } from '../../hooks/useIsMobile'

import styles from './ProfilePage.module.scss'

export const fetchPosts = (session: Session, webId: string) => {
  return new Promise<PostShape[]>(async (resolve) => {
    if (session.info.isLoggedIn) {
      const publicTypeIndexUrl = webId?.replace(
        'profile/card#me',
        `settings/publicTypeIndex.ttl`
      )
      postIndex.fetcher._fetch = session.fetch
      await postIndex
        .findAll({ doc: publicTypeIndexUrl as string })
        .then(async (posts) => {
          const fullPosts = (await Promise.all(
            posts.data?.map(async (postIndex) => {
              return (
                await post.findOne({
                  where: { id: postIndex.link },
                  doc: new NamedNode(postIndex.link).doc().uri,
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
  const isMobile = useIsMobile()

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
        setPosts([...newPosts])
        setIsLoading(false)
      })
    }
  }, [currentSession, params.webId])

  return (
    <Page
      title={userProfile ? (userProfile.name as string) : 'Profile'}
      loading={isLoading}
      loadingText="Loading Posts..."
      hideSearch={isMobile}
    >
      {params.webId === currentSession?.info.webId ? null : (
        <div className={styles.header}>
          <h2>{userProfile ? userProfile.name : 'Loading User...'}</h2>
          {userProfile?.id && (
            <FollowButton webId={new URL(params.webId as string)} />
          )}
        </div>
      )}
      <PostGrid posts={posts} />
      {currentSession?.info.isLoggedIn &&
        currentSession.info.webId ===
          decodeURIComponent(params.webId as string) && (
          <div className="footer">
            <UploadButton />
          </div>
        )}
    </Page>
  )
}

export default ProfilePage
