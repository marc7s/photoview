import { useState } from 'react'
import { Button, TextField } from '../../primitives/form/Input'

type AdvancedSearchFilterProps = {
  title: string
  id: string
  filterChangedHandler: (newVal: (string | undefined)[]) => void
}

export const AdvancedSearchFilter = ({
  title,
  id,
  filterChangedHandler,
}: AdvancedSearchFilterProps) => {
  const [filterValues, setFilterValues] = useState<(string | undefined)[]>([undefined])

  function submit() {
    filterChangedHandler(filterValues)
  }

  function setFilterValue(index: number, value: string | undefined) {
    const fc = [...filterValues]
    fc[index] = value
    setFilterValues(fc)
  }

  function removeFilter(index: number) {
    const fc = [...filterValues]
    fc.splice(index, 1)
    setFilterValues(fc)
    submit()
  }

  return <div className="flex">
    {
      filterValues.map((v, i) => <div className="flex" key={id + i}>
          <TextField
            type="text"
            label={title}
            id={id + i}
            value={v}
            onChange={event => {
              setFilterValue(i, event.target.value)
            }}
            onBlur={() => submit()}
            onKeyDown={event => event.key == 'Enter' && submit()}
          />
          <Button onClick={() => removeFilter(i)}>-</Button>
      </div>)
    }
    <Button onClick={() => setFilterValues([...filterValues, undefined])}>+</Button>
  </div>
    
}
