import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { AdvancedSearchFilter } from './AdvancedSearchFilter'
import { useLazyQuery, gql } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import SearchGallery from '../searchGallery/SearchGallery'
import { MEDIA_GALLERY_FRAGMENT } from '../photoGallery/MediaGallery'
import { Button } from '../../primitives/form/Input'
import { advancedSearchQuery, advancedSearchQuery_advancedSearch_media } from './__generated__/advancedSearchQuery'
import { SearchableDropdown } from './SearchableDropdown'
import { searchQuery_search_albums } from '../header/__generated__/searchQuery'

/*interface SearchFilters {
  albumIDs: string[]
  faceGroupIDs: string[]
  fileNameNeedles: string[],
  cameras: string[],
  startDate: Date | undefined,
  endDate: Date | undefined
}*/

interface DateFilterSpan {
  startDate: Date | undefined
  endDate: Date | undefined
}

type DateFilterProps = {
  mode: DateFilterMode
  updateDateFilter: (span: DateFilterSpan) => void
}

function DateFilter({ mode, updateDateFilter }: DateFilterProps): JSX.Element {
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined)
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined)

  // Reset start or end date when changing modes, so endpoints are not accidentally transferred
  useEffect(() => {
    if (mode === "After")
      setFilterEndDate(undefined)
    if (mode === "Before")
      setFilterStartDate(undefined)
  }, [mode])

  // Synchronize local state with external state
  useEffect(() => {
    updateDateFilter({
      startDate: filterStartDate,
      endDate: filterEndDate
    })
  }, [filterStartDate, filterEndDate])
  
  // If date, only consider the first element as we only expect a single value
  function dateChanged(setState: Dispatch<SetStateAction<Date | undefined>>, newVals: (string | undefined)[]) {
    const newDateVal = newVals.length < 1 || newVals[0] === undefined || isNaN(Date.parse(newVals[0])) ? undefined : new Date(newVals[0])
    setState(newDateVal)
  }

  const startDateFilter: JSX.Element = <AdvancedSearchFilter
      title="Start date"
      id="startDateFilter"
      type="date"
      maxFilterCount={1}
      filterChangedHandler={(val) => dateChanged(setFilterStartDate, val)}
    />
  
  const endDateFilter: JSX.Element = <AdvancedSearchFilter
      title="End date"
      id="endDateFilter"
      type="date"
      maxFilterCount={1}
      filterChangedHandler={(val) => dateChanged(setFilterEndDate, val)}
    />
  
  return <>
    { mode !== "After" && startDateFilter }
    { mode !== "Before" && endDateFilter }
  </>
}

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

type DateFilterMode = "Between" | "Before" | "After"

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
  
  const [filterAlbums, setFilterAlbums] = useState<searchQuery_search_albums[]>([])
  const [filterFileNames, setFilterFileNames] = useState<string[]>([])
  const [filterFaceGroups, setFilterFaceGroups] = useState<number[]>([])
  const [filterCameras, setFilterCameras] = useState<string[]>([])
  const [filterDateSpan, setFilterDateSpan] = useState<DateFilterSpan>({startDate: undefined, endDate: undefined})

  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>("Between")

  const albumSearchQuery = gql`
  query albumSearchQuery($query: String!) {
    search(query: $query) {
      query
      albums {
        id
        title
        thumbnail {
          thumbnail {
            url
          }
        }
      }
    }
  }
`

  const [selectedAlbum, setSelectedAlbum] = useState<searchQuery_search_albums | null>(null)

  useEffect(() => {
    if (selectedAlbum === null || filterAlbums.find(album => album.id === selectedAlbum.id) !== undefined)
      return

    setFilterAlbums([...filterAlbums, selectedAlbum])
    setSelectedAlbum(null)
  }, [selectedAlbum])

  function removeFilterAlbum(album: searchQuery_search_albums) {
    setFilterAlbums(filterAlbums.filter(fa => fa.id !== album.id))
  }
  
  /*const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    albumIDs: [],
    faceGroupIDs: [],
    fileNameNeedles: [],
    cameras: [],
    startDate: undefined,
    endDate: undefined
  })*/

  function updateDateFilter(span: DateFilterSpan) {
    setFilterDateSpan(span)
    setSearchUpdated(false)
  }

  function filterChanged<T>(conv: (_: string | undefined) => T | undefined, setState: Dispatch<SetStateAction<T[]>>, newValues: (string | undefined)[]): void {
    setState(newValues.filter(v => v && v.length > 0).map(v => conv(v)).filter(v => v !== undefined))
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
    console.log(filterDateSpan)

    const fileNames: string[] = ['2621', '2623126']
    const albumIDs: string[] = filterAlbums.map(al => al.id)
    const startDate: Date | undefined = filterDateSpan.startDate ?? new Date("0000-01-01") // Temporary, send a "null date" instead of null/undefined, otherwise GQL crashes
    const endDate: Date | undefined = filterDateSpan.endDate ?? new Date("0000-01-01") // Temporary, send a "null date" instead of null/undefined, otherwise GQL crashes
    
    fetchSearches({ variables: { fileNames: fileNames, albumIDs: albumIDs, startDate: startDate, endDate: endDate } })
    setSearchUpdated(true)
  }

  return (
    <div>
      <div className="mb-10 flex flex-col gap-6">
        <SearchableDropdown searchQuery={albumSearchQuery} setSelectedResult={setSelectedAlbum} clearOnSelection={true} />

        {
          filterAlbums.map(album => <div key={album.id}>
            <span>{ album.title }</span>
            <Button onClick={() => removeFilterAlbum(album)}>-</Button>
          </div>)
        }
        
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

        <div className='flex flex-col gap-4 border-2 border-black p-2'>
          <h1>Date filter</h1>
          <div className='flex'>
            <Button disabled={dateFilterMode === "Between"} onClick={() => setDateFilterMode("Between")}>{t('advanced_search.date_modes.between', 'Between')}</Button>
            <Button disabled={dateFilterMode === "Before"} onClick={() => setDateFilterMode("Before")}>{t('advanced_search.date_modes.before', 'Before')}</Button>
            <Button disabled={dateFilterMode === "After"} onClick={() => setDateFilterMode("After")}>{t('advanced_search.date_modes.after', 'After')}</Button>
          </div>

          <DateFilter
            mode={dateFilterMode}
            updateDateFilter={updateDateFilter}
          />
        </div>
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
