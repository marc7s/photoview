import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { DocumentNode, useLazyQuery } from '@apollo/client'
import { useTranslation } from 'react-i18next'
import { debounce, DebouncedFn } from '../../helpers/utils'
import { useLocation } from 'react-router-dom'
import classNames from 'classnames'
import { ProtectedImage } from '../photoGallery/ProtectedMedia'
import {
  searchQuery,
  searchQuery_search_albums,
} from '../header/__generated__/searchQuery'

const SearchWrapper = styled.div.attrs({
  className: 'w-full max-w-xs lg:relative',
})``

type SearchableDropdownProps = {
  searchQuery: DocumentNode
  clearOnSelection: boolean
  setSelectedResult: React.Dispatch<React.SetStateAction<searchQuery_search_albums | null>>
}

export function SearchableDropdown({
  searchQuery,
  clearOnSelection,
  setSelectedResult
}: SearchableDropdownProps) {

  const { t } = useTranslation()
  const [fetchSearches, fetchResult] = useLazyQuery<searchQuery>(searchQuery)
  const [query, setQuery] = useState('')
  const [fetched, setFetched] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const inputEl = useRef<HTMLInputElement>(null)
  
  //type QueryFn = (query: string) => void
  type QueryFn = (query: unknown) => void

  const debouncedFetch = useRef<null | DebouncedFn<QueryFn>>(null)
  useEffect(() => {
    debouncedFetch.current = debounce<QueryFn>(query => {
      fetchSearches({ variables: { query } })
      setFetched(true)
      setExpanded(true)
    }, 250)

    return () => {
      debouncedFetch.current?.cancel()
    }
  }, [])
  
  const fetchEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.persist()

    setQuery(e.target.value)
    if (e.target.value.trim() != '' && debouncedFetch.current) {
      debouncedFetch.current(e.target.value.trim())
    } else {
      setFetched(false)
    }
  }
  
  const location = useLocation()
  useEffect(() => {
    setExpanded(false)
    setQuery('')
  }, [location])

  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [highlightedItem, setHighlightedItem] = useState<number | null>(null)

  useEffect(() => {
    setSelectedResult(selectedItem === null ? null : albums[selectedItem])
    
    if(clearOnSelection)
    {
      setSelectedItem(null)
      setExpanded(false)
      setQuery('')
    }
      
  }, [selectedItem])

  const searchData = fetchResult.data
  let albums = searchData?.search.albums || []

  albums = albums.slice(0, 5)

  const selectedItemId =
    selectedItem !== null
      ? albums.map(x => x.id)[selectedItem]
      : null

  useEffect(() => {
    const elem = inputEl.current
    if (!elem) return

    const focusEvent = () => {
      setExpanded(true)
    }

    const blurEvent = () => {
      setExpanded(false)
    }

    elem.addEventListener('focus', focusEvent)
    elem.addEventListener('blur', blurEvent)

    return () => {
      elem.removeEventListener('focus', focusEvent)
      elem.removeEventListener('blur', blurEvent)
    }
  }, [inputEl])

  useEffect(() => {
    setSelectedItem(null)
  }, [searchData])

  useEffect(() => {
    const totalItems = albums.length

    const keydownEvent = (event: KeyboardEvent) => {
      if (!expanded) return

      if (event.key == 'ArrowDown') {
        event.preventDefault()
        setSelectedItem(i => (i === null ? 0 : Math.min(totalItems - 1, i + 1)))
      } else if (event.key == 'ArrowUp') {
        event.preventDefault()
        setSelectedItem(i => (i === null ? 0 : Math.max(0, i - 1)))
      } else if (event.key == 'Escape') {
        inputEl.current?.blur()
      }
    }

    document.addEventListener('keydown', keydownEvent)

    return () => {
      document.removeEventListener('keydown', keydownEvent)
    }
  }, [searchData])

  let results = null
  if (query.trim().length > 0 && fetched) {
    results = (
      <SearchResults
        albums={albums}
        query={fetchResult.data?.search.query || ''}
        highlightedItem={highlightedItem}
        setSelectedItem={setSelectedItem}
        setHighlightedItem={setHighlightedItem}
        loading={fetchResult.loading}
        expanded={expanded}
      />
    )
  }
  
  return <SearchWrapper>
    <input
      ref={inputEl}
      autoComplete="off"
      aria-controls="search-results"
      aria-haspopup="listbox"
      aria-autocomplete="list"
      aria-activedescendant={
        selectedItemId ? `search-item-${selectedItemId}` : ''
      }
      aria-expanded={expanded}
      className="w-full py-2 px-3 z-10 relative rounded-md bg-gray-50 focus:bg-white border border-gray-50 focus:border-blue-400 outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 dark:bg-dark-bg2 dark:border-dark-bg2 dark:focus:bg-[#2a2f35]"
      type="search"
      placeholder={t('header.search.placeholder', 'Search')}
      onChange={fetchEvent}
      value={selectedItem !== null ? albums[selectedItem].title : query}
    />
    {results}
  </SearchWrapper>
    
}

const ResultTitle = styled.h1.attrs({
  className:
    'uppercase text-gray-700 dark:text-gray-200 text-sm font-semibold mt-4 mb-2 mx-1',
})``

type SearchResultsProps = {
  albums: searchQuery_search_albums[]
  loading: boolean
  highlightedItem: number | null
  setSelectedItem: React.Dispatch<React.SetStateAction<number | null>>
  setHighlightedItem: React.Dispatch<React.SetStateAction<number | null>>
  query: string
  expanded: boolean
}

const SearchResults = ({
  albums,
  loading,
  highlightedItem,
  setSelectedItem,
  setHighlightedItem,
  query,
  expanded,
}: SearchResultsProps) => {
  const { t } = useTranslation()

  const albumElements = albums.map((album, i) => (
    <AlbumRow
      key={album.id}
      query={query}
      album={album}
      highlighted={highlightedItem == i}
      setSelected={() => setSelectedItem(i)}
      setHighlighted={() => setHighlightedItem(i)}
    />
  ))

  let message = null
  if (loading) message = t('header.search.loading', 'Loading results...')
  else if (albums.length == 0)
    message = t('header.search.no_results', 'No results found')

  if (message) message = <div className="mt-8 text-center">{message}</div>

  return (
    <div
      id="search-results"
      role="listbox"
      className={classNames(
        'absolute bg-white dark:bg-dark-bg left-0 right-0 top-[72px] overflow-y-auto h-[calc(100vh-152px)] border dark:border-dark-border px-4 z-0',
        'lg:top-[40px] lg:shadow-md lg:rounded-b lg:max-h-[560px]',
        { hidden: !expanded }
      )}
      tabIndex={-1}
      onMouseDown={e => {
        // Prevent input blur event
        e.preventDefault()
      }}
    >
      {message}
      {albumElements.length > 0 && (
        <>
          <ResultTitle>
            {t('header.search.result_type.albums', 'Albums')}
          </ResultTitle>
          <ul aria-label="albums">{albumElements}</ul>
        </>
      )}
    </div>
  )
}

type SearchRowProps = {
  id: string
  preview: React.ReactNode
  label: React.ReactNode
  highlighted: boolean
  setSelected(): void
  setHighlighted(): void
}

const SearchRow = ({
  id,
  preview,
  label,
  highlighted,
  setSelected,
  setHighlighted
}: SearchRowProps) => {
  const rowEl = useRef<HTMLLIElement>(null)

  if (highlighted) {
    rowEl.current?.scrollIntoView({
      block: 'nearest',
    })
  }

  return (
    <li
      id={`search-item-${id}`}
      ref={rowEl}
      role="option"
      aria-selected={highlighted}
      onMouseOver={() => setHighlighted()}
      onClick={() => setSelected()}
      className={classNames('rounded p-1 mt-1', {
        'bg-gray-100 dark:bg-dark-bg2': highlighted,
      })}
    >
      {preview}
      <span className="flex-grow pl-2 text-sm">{label}</span>
    </li>
  )
}

type AlbumRowArgs = {
  query: string
  album: searchQuery_search_albums
  highlighted: boolean
  setSelected(): void
  setHighlighted(): void
}

const AlbumRow = ({ query, album, highlighted, setSelected, setHighlighted }: AlbumRowArgs) => (
  <SearchRow
    key={album.id}
    id={album.id}
    preview={
      <ProtectedImage
        src={album?.thumbnail?.thumbnail?.url}
        className="w-14 h-14 rounded object-cover"
      />
    }
    label={searchHighlighted(query, album.title)}
    highlighted={highlighted}
    setSelected={setSelected}
    setHighlighted={setHighlighted}
  />
)

const searchHighlighted = (query: string, text: string) => {
  const i = text.toLowerCase().indexOf(query.toLowerCase())

  if (i == -1) {
    return text
  }

  const start = text.substring(0, i)
  const middle = text.substring(i, i + query.length)
  const end = text.substring(i + query.length)

  return (
    <span>
      {start}
      <span className="font-semibold whitespace-pre">{middle}</span>
      {end}
    </span>
  )
}