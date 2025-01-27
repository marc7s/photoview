import { useEffect, useState } from 'react'
import { TextField } from '../../primitives/form/Input'

type AdvancedSearchFilterProps = {
  id: string
  filterChangedHandler: (newVal: string | undefined) => void
}

export const AdvancedSearchFilter = ({
  id,
  filterChangedHandler,
}: AdvancedSearchFilterProps) => {
  const [filterValue, setFilterValue] = useState<string | undefined>()

  function submit() {
    filterChangedHandler(filterValue)
  }

  return (
    <TextField
      type="text"
      id={id}
      value={filterValue}
      onChange={event => {
        setFilterValue(event.target.value)
      }}
      onBlur={() => submit()}
      onKeyDown={event => event.key == 'Enter' && submit()}
    />
  )
}
