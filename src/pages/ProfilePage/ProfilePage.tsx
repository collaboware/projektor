import { Session } from '@inrupt/solid-client-authn-browser'
import { NamedNode } from 'rdflib'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useRecoilState } from 'recoil'

import FollowButton from '../../components/FollowButton/FollowButton'
import Page from '../../components/Page/Page'
import PostGrid from '../../components/PostGrid/PostGrid'
import UploadButton from '../../components/UploadButton/UploadButton'
import { post, postIndex, PostShape, solidProfile } from '../../generated/shex'
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
          const fullPosts = (
            await Promise.all(
              posts.data?.map(async (postIndex) => {
                return (
                  await post.findOne({
                    where: { id: postIndex.link },
                    doc: new NamedNode(postIndex.link).doc().uri,
                  })
                ).data
              }) ?? []
            )
          ).sort((postA, postB) => {
            const postATimeString = postA?.id.substring(
              postA?.id.lastIndexOf('/') + 1,
              postA?.id.lastIndexOf('-post')
            )
            const postBTimeString = postB?.id.substring(
              postB?.id.lastIndexOf('/') + 1,
              postB?.id.lastIndexOf('-post')
            )
            return Number(postBTimeString) - Number(postATimeString)
          }) as PostShape[]
          resolve(fullPosts)
        })
    }
    resolve([])
  })
}

export const deletePost = (session: Session, postToDelete: PostShape) => {
  return new Promise<void>(async (resolve) => {
    if (session.info.isLoggedIn) {
      const publicTypeIndexUrl = session.info.webId?.replace(
        'profile/card#me',
        `settings/publicTypeIndex.ttl`
      )
      postIndex.fetcher._fetch = session.fetch
      post.fetcher._fetch = session.fetch
      await post.fetcher.webOperation('DELETE', postToDelete?.link as string)
      await post.delete({
        where: { id: postToDelete?.id as string },
        doc: postToDelete?.id as string,
      })
      await post.fetcher.webOperation('DELETE', postToDelete?.id)
      await postIndex.delete({
        where: { id: postToDelete.id as string },
        doc: publicTypeIndexUrl as string,
      })
      resolve()
    }
  })
}

const ProfilePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [auth, _] = useRecoilState(authState)
  const [{ profile }, setUserProfile] = useRecoilState(userState)
  const [posts, setPosts] = useRecoilState(postsState)
  const params = useParams<{ webId: string }>()
  const isMobile = useIsMobile()
  const { session } = auth

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
                setUserProfile({ profile: profile.data })
              }
            })
        }
        setPosts({ posts: [...newPosts] })
        setIsLoading(false)
      })
    }
  }, [session, params.webId])

  return (
    <Page
      title={profile ? (profile?.name as string) : 'Profile'}
      loading={isLoading}
      loadingText="Loading Posts..."
      hideSearch={isMobile}
    >
      {!isLoading && params.webId !== auth.user?.id ? (
        <div className={styles.header}>
          <h2>{profile ? profile?.name : 'Loading User...'}</h2>
          <FollowButton webId={new URL(params.webId as string)} />
        </div>
      ) : null}
      {!isLoading && <PostGrid posts={posts.posts} />}
      {!isLoading && auth.user?.id === params.webId && (
        <div className="footer">
          <UploadButton />
        </div>
      )}
    </Page>
  )
}

export default ProfilePage
