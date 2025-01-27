import React, { useEffect, useReducer } from 'react'
import MediaGallery from '../photoGallery/MediaGallery'
import {
  mediaGalleryReducer,
  urlPresentModeSetupHook,
} from '../photoGallery/mediaGalleryReducer'
import { MediaGalleryFields } from '../photoGallery/__generated__/MediaGalleryFields'

type SearchGalleryProps = {
  media?: MediaGalleryFields[]
  loading?: boolean
}

const SearchGallery = React.forwardRef(
  (
    {
      media,
      loading = false,
    }: SearchGalleryProps,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const [mediaState, dispatchMedia] = useReducer(mediaGalleryReducer, {
      presenting: false,
      activeIndex: -1,
      media: media || [],
    })

    useEffect(() => {
      dispatchMedia({ type: 'replaceMedia', media: media || [] })
    }, [media])

    urlPresentModeSetupHook({
      dispatchMedia,
      openPresentMode: event => {
        dispatchMedia({
          type: 'openPresentMode',
          activeIndex: event.state.activeIndex,
        })
      },
    })

    return (
      <div ref={ref}>
        <MediaGallery
          loading={loading}
          mediaState={mediaState}
          dispatchMedia={dispatchMedia}
        />
      </div>
    )
  }
)

export default SearchGallery
