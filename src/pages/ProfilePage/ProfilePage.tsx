import { getDefaultSession, Session } from '@inrupt/solid-client-authn-browser'
import classNames from 'classnames'
import mime from 'mime'
import { NamedNode } from 'rdflib'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRecoilState } from 'recoil'

import FollowButton from '../../components/FollowButton/FollowButton'
import Page from '../../components/Page/Page'
import { getPostLink } from '../../components/Post/Post'
import PostGrid from '../../components/PostGrid/PostGrid'
import ShareButton from '../../components/ShareButton/ShareButton'
import UploadButton, {
  getQualityLink,
  ImageQualities,
} from '../../components/UploadButton/UploadButton'
import { post, postIndex, PostShape, solidProfile } from '../../generated/shex'
import { useFollowingList } from '../../hooks/useFollowingList'
import { useIsMobile } from '../../hooks/useIsMobile'
import { authState } from '../../state/auth'
import { postsState } from '../../state/posts'
import { userState } from '../../state/user'

import styles from './ProfilePage.module.scss'

export const fetchPosts = (session: Session | null, webId: string) => {
  return new Promise<PostShape[]>(async (resolve) => {
    const publicTypeIndexUrl = webId?.replace(
      'profile/card#me',
      `settings/publicTypeIndex.ttl`
    )
    if (session?.info.isLoggedIn) {
      postIndex.fetcher._fetch = session.fetch
    }
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
      .catch(() => {
        resolve([])
      })
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
      await Promise.all(
        ImageQualities.map(async (quality) => {
          if (quality === 'raw') {
            await post.fetcher.webOperation(
              'DELETE',
              postToDelete?.link as string
            )
          } else {
            if (mime.lookup(postToDelete.link).startsWith('video')) {
              await post.fetcher.webOperation(
                'DELETE',
                getQualityLink(postToDelete.link, quality as number)
              )
            }
            await post.fetcher.webOperation(
              'DELETE',
              getPostLink(postToDelete?.link as string, quality as number)
            )
          }
        })
      )
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
  const { isLoading: isLoadingFollowingList } = useFollowingList()
  const [auth, setAuthState] = useRecoilState(authState)
  const [{ profile }, setUserProfile] = useRecoilState(userState)
  const [posts, setPosts] = useRecoilState(postsState)
  const params = useParams<{ webId: string }>()
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const { session } = auth

  useEffect(() => {
    setIsLoading(true)
    const webId = decodeURIComponent(params.webId as string)
    fetchPosts(session, webId).then((newPosts) => {
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
      setPosts({ posts: [...newPosts] })
      setIsLoading(false)
    })
  }, [session, params.webId])

  return (
    <Page
      title={profile ? (profile?.name as string) : 'Profile'}
      loading={isLoading || isLoadingFollowingList}
      loadingText="Loading Posts..."
      hideSearch={isMobile}
    >
      {!isLoading && params.webId !== auth.user?.id ? (
        <div className={styles.header}>
          <h2>{profile ? profile?.name : 'Loading User...'}</h2>
          {auth.user && (
            <FollowButton webId={new URL(params.webId as string)} />
          )}
        </div>
      ) : null}
      {!isLoading &&
        posts.posts.length > 0 &&
        params.webId &&
        posts.posts[0].id.includes(new URL(params.webId).host) && (
          <PostGrid
            posts={[
              ...posts.posts,
              ...posts.posts,
              ...posts.posts,
              ...posts.posts,
              ...posts.posts,
              ...posts.posts,
              ...posts.posts,
              ...posts.posts,
              ...posts.posts,
              ...posts.posts,
            ]}
          />
        )}
      {!isLoading && auth.user?.id === params.webId && (
        <div className={styles.footer}>
          <UploadButton
            onUpload={() => {
              setIsLoading(true)
              fetchPosts(auth.session as Session, params.webId as string).then(
                (newPosts) => {
                  setPosts({ posts: [...newPosts] })
                  setIsLoading(false)
                }
              )
            }}
          />
          {!isLoading && profile?.name && (
            <ShareButton
              title={'Projektor'}
              text={profile.name}
              url={window.location.href}
            />
          )}
          <button
            className={classNames('danger', styles.danger)}
            onClick={() => {
              const currentSession = getDefaultSession()
              currentSession.logout().then(() => {
                setAuthState({ session: null, user: null })
                navigate('/login')
              })
            }}
          >
            Logout
          </button>
        </div>
      )}
    </Page>
  )
}

export default ProfilePage
