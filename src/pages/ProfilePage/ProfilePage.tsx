import { ISessionInfo } from '@inrupt/solid-client-authn-browser'
import React, { useContext, useEffect, useState } from 'react'

import Page from '../../components/Page/Page'
import PostGrid from '../../components/PostGrid/PostGrid'
import { CurrentUserAuthContext } from '../../context/CurrentUserAuthContext'
import { post, postIndex, PostShape } from '../../generated/shex'

export const fetchPosts = (sessionInfo: ISessionInfo, webId: string) => {
  return new Promise<PostShape[]>(async (resolve) => {
    if (sessionInfo.isLoggedIn) {
      const publicTypeIndexUrl = webId?.replace(
        'profile/card#me',
        `settings/publicTypeIndex.ttl`
      )
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

  useEffect(() => {
    if (currentSession?.info) {
      fetchPosts(currentSession.info, currentSession.info.webId as string).then(
        (posts) => setPosts(posts)
      )
    }
  }, [currentSession])

  return (
    <Page title="Profile">
      <PostGrid posts={posts} />
    </Page>
  )
}

export default ProfilePage
