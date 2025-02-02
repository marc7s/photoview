import { Dispatch, SetStateAction, useReducer, useState } from 'react'
import { AdvancedSearchFilter } from './AdvancedSearchFilter'
import { useLazyQuery, gql } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import SearchGallery from '../searchGallery/SearchGallery'
import { MEDIA_GALLERY_FRAGMENT } from '../photoGallery/MediaGallery'
import { Button } from '../../primitives/form/Input'
import { advancedSearchQuery, advancedSearchQuery_advancedSearch_media } from './__generated__/advancedSearchQuery'

/*interface SearchFilters {
  albumIDs: string[]
  faceGroupIDs: string[]
  fileNameNeedles: string[],
  cameras: string[],
  startDate: Date | undefined,
  endDate: Date | undefined
}*/

const ADV_SEARCH_QUERY = gql`
  ${MEDIA_GALLERY_FRAGMENT}

  query advancedSearchQuery($fileNames: [String], $albumIDs: [Int], $startDate: Time, $endDate: Time) {
    advancedSearch(fileNames: $fileNames, albumIDs: $albumIDs, startDate: $startDate, endDate: $endDate) {
      media {
        ...MediaGalleryFields
      }
    }
  }
`

type AdvancedSearchResultsProps = {
  media: advancedSearchQuery_advancedSearch_media[]
  loading: boolean
}

const NULLDATE = new Date("0000-01-01")

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
  const [filterFileNames, setFilterFileNames] = useState<string[]>([])
  const [filterFaceGroups, setFilterFaceGroups] = useState<number[]>([])
  const [filterCameras, setFilterCameras] = useState<string[]>([])
  const [filterStartDate, setFilterStartDate] = useState<Date>(NULLDATE)
  const [filterEndDate, setFilterEndDate] = useState<Date>(NULLDATE)
  
  /*const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    albumIDs: [],
    faceGroupIDs: [],
    fileNameNeedles: [],
    cameras: [],
    startDate: undefined,
    endDate: undefined
  })*/

  function filterChanged<T>(conv: (_: string | undefined) => T | undefined, setState: Dispatch<SetStateAction<T[]>>, newValues: (string | undefined)[]): void {
    setState(newValues.filter(v => v && v.length > 0).map(v => conv(v)).filter(v => v !== undefined))
    setSearchUpdated(false)
  }

  // If date, only consider the first element as we only expect a single value
  function dateChanged(setState: Dispatch<SetStateAction<Date>>, newVals: (string | undefined)[]) {
    const newDateVal = newVals.length < 1 || newVals[0] === undefined || isNaN(Date.parse(newVals[0])) ? NULLDATE : new Date(newVals[0])
    setState(newDateVal)
    setSearchUpdated(false)
  }

  function intConv(value: string | undefined): number | undefined {
    if (value === undefined) return undefined;
    const v = parseInt(value);
    return isNaN(v) ? undefined : v;
  }

  function search() {
    console.log(filterAlbums)
    console.log(filterFileNames)
    console.log(filterFaceGroups)
    console.log(filterCameras)
    console.log(filterStartDate)
    console.log(filterEndDate)

    const fileNames: string[] = ['2621', '2623126']
    const albumIDs: number[] = [1]
    const startDate: Date | undefined = new Date()
    const endDate: Date | undefined = new Date()
    
    fetchSearches({ variables: { fileNames: fileNames, albumIDs: albumIDs, startDate: startDate, endDate: endDate } })
    setSearchUpdated(true)
  }

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4">
        <AdvancedSearchFilter
          title="Album"
          id="albumFilters"
          type="number"
          filterChangedHandler={(val) => filterChanged(intConv, setFilterAlbums, val)}
        />
        
        <AdvancedSearchFilter
          title="File name"
          id="fileNameFilters"
          type="text"
          filterChangedHandler={(val) => filterChanged(v => v, setFilterFileNames, val)}
        />

        <AdvancedSearchFilter
          title="Face group"
          id="faceGroupFilters"
          type="number"
          filterChangedHandler={(val) => filterChanged(intConv, setFilterFaceGroups, val)}
        />

        <AdvancedSearchFilter
          title="Camera"
          id="cameraFilters"
          type="text"
          filterChangedHandler={(val) => filterChanged(v => v, setFilterCameras, val)}
        />

        <AdvancedSearchFilter
          title="Start date"
          id="startDateFilter"
          type="date"
          maxFilterCount={1}
          filterChangedHandler={(val) => dateChanged(setFilterStartDate, val)}
        />

        <AdvancedSearchFilter
          title="End date"
          id="endDateFilter"
          type="date"
          maxFilterCount={1}
          filterChangedHandler={(val) => dateChanged(setFilterEndDate, val)}
        />
      </div>
      <Button onClick={() => search()} disabled={searchUpdated}>
        {t('advanced_search.search', 'Search')}
      </Button>
      {fetchResult.data && (
        <div className="mt-20">
          <h1>{t('advanced_search.search_results', 'Search results')}</h1>
          <AdvancedSearchResults
            media={fetchResult.data.advancedSearch.media}
            loading={false}
          />
        </div>
      )}
    </div>
  )
}
