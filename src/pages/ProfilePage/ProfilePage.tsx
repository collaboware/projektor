import { Session } from '@inrupt/solid-client-authn-browser'
import { NamedNode } from 'rdflib'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useRecoilState } from 'recoil'

import FollowButton from '../../components/FollowButton/FollowButton'
import Page from '../../components/Page/Page'
import PostGrid from '../../components/PostGrid/PostGrid'
import UploadButton from '../../components/UploadButton/UploadButton'
import {
  post,
  postIndex,
  PostShape,
  solidProfile,
} from '../../generated/shex'
import { useIsMobile } from '../../hooks/useIsMobile'
import { authState } from '../../state/auth'
import { postsState } from '../../state/posts'
import { userState } from '../../state/user'

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
  // const { session: currentSession } = useContext(CurrentUserAuthContext)
  // const [posts, setPosts] = useState<PostShape[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // const [userProfile, setUserProfile] = useState<SolidProfileShape | null>(null)
  const [auth, _] = useRecoilState(authState)
  const [userProfile, setUserProfile] = useRecoilState(userState)
  const [posts, setPosts] = useRecoilState(postsState)
  const params = useParams<{ webId: string }>()
  const isMobile = useIsMobile()
  const {session} = auth;

  useEffect(() => {
    setIsLoading(true)
    const webId = decodeURIComponent(params.webId as string)
    if (session?.info) {
      fetchPosts(session, webId).then((newPosts) => {
        if (session.info.webId !== params.webId) {
          solidProfile.fetcher._fetch = session.fetch
          solidProfile
            .findOne({
              where: { id: webId },
              doc: webId as string,
            })
            .then((profile) => {
              if (profile.data) {
                setUserProfile({...userProfile, current: profile.data})
              }
            })
        }
        setPosts({posts: [...newPosts]})
        setIsLoading(false)
      })
    }
  }, [session, params.webId])

  return (
    <Page
      title={userProfile ? (userProfile.current?.name as string) : 'Profile'}
      loading={isLoading}
      loadingText="Loading Posts..."
      hideSearch={isMobile}
    >
      {params.webId === userProfile.current?.id ? null : (
        <div className={styles.header}>
          <h2>{userProfile ? userProfile.current?.name : 'Loading User...'}</h2>
          {userProfile.current?.id && (
            <FollowButton webId={new URL(params.webId as string)} />
          )}
        </div>
      )}
      <PostGrid posts={posts.posts} />
      {session?.info.isLoggedIn &&
        session.info.webId ===
          decodeURIComponent(params.webId as string) && (
          <div className="footer">
            <UploadButton />
          </div>
        )}
    </Page>
  )
}

export default ProfilePage
