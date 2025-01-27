import { useReducer, useState } from 'react'
import { AdvancedSearchFilter } from './AdvancedSearchFilter'
import { useLazyQuery, gql } from '@apollo/client'
import {
  advancedSearchQuery,
  advancedSearchQuery_search_media,
} from '../../Pages/SearchPage/__generated__/advancedSearchQuery'
import { useTranslation } from 'react-i18next'
import { mediaGalleryReducer } from '../photoGallery/mediaGalleryReducer'
import SearchGallery from '../searchGallery/SearchGallery'
import { MEDIA_GALLERY_FRAGMENT } from '../photoGallery/MediaGallery'
import { Button } from '../../primitives/form/Input'

interface SearchFilters {
  albumIDs: string[]
  faceGroupIDs: string[]
  fileNameNeedles: string[]
}

const ADV_SEARCH_QUERY = gql`
  ${MEDIA_GALLERY_FRAGMENT}

  query advancedSearchQuery($query: String!) {
    search(query: $query) {
      query
      media {
        ...MediaGalleryFields
      }
    }
  }
`

type AdvancedSearchResultsProps = {
  media: advancedSearchQuery_search_media[]
  loading: boolean
}

const AdvancedSearchResults = ({
  media,
  loading,
}: AdvancedSearchResultsProps) => {
  const { t } = useTranslation()

  let message = null
  if (loading) message = t('header.search.loading', 'Loading results...')
  else if (media.length == 0)
    message = t('header.search.no_results', 'No results found')

  if (message) message = <div className="mt-8 text-center">{message}</div>

  return <SearchGallery media={media} loading={loading} />
}

export const AdvancedSearchQuery = () => {
  const { t } = useTranslation()
  const [fetchSearches, fetchResult] =
    useLazyQuery<advancedSearchQuery>(ADV_SEARCH_QUERY)
  const [searchUpdated, setSearchUpdated] = useState<boolean>(false)
  const [filterAlbums, setFilterAlbums] = useState<number[]>([])
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    albumIDs: [],
    faceGroupIDs: [],
    fileNameNeedles: [],
  })

  function albumFilterChanged(newAlbum: string | undefined) {
    console.log(newAlbum)
    setSearchUpdated(false)
  }

  function search() {
    console.log('hello team')
    fetchSearches({ variables: { query: '2023' } })
    setSearchUpdated(true)
  }

  return (
    <div>
      <div className="mb-10">
        <AdvancedSearchFilter
          id="albumFilter"
          filterChangedHandler={albumFilterChanged}
        />
      </div>
      <Button onClick={() => search()} disabled={searchUpdated}>
        {t('advanced_search.search', 'Search')}
      </Button>
      {fetchResult.data && (
        <div className="mt-20">
          <h1>{t('advanced_search.search_results', 'Search results')}</h1>
          <AdvancedSearchResults
            media={fetchResult.data.search.media}
            loading={false}
          />
        </div>
      )}
    </div>
  )
}
