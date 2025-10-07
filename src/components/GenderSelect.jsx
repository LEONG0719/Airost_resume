'use client'

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions
} from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react'

const genderOptions = [
  { id: '', name: 'All Genders' },
  { id: 'male', name: 'Male' },
  { id: 'female', name: 'Female' }
]

export default function GenderSelect({ genderValue, setGenderValue }) {
  const [selected, setSelected] = useState(
    genderOptions.find(g => g.id === genderValue) || genderOptions[0]
  )

  useEffect(() => {
    const match = genderOptions.find(g => g.id === genderValue)
    setSelected(match || genderOptions[0])
  }, [genderValue])

  const handleChange = (option) => {
    setSelected(option)
    setGenderValue(option.id)
  }

  return (
    <Listbox value={selected} onChange={handleChange}>
      <div className="relative w-full">
        <ListboxButton className="relative w-full cursor-pointer rounded-md border dark:bg-blue-950 border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
          <span className="block truncate">{selected.name}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-amber-300" aria-hidden="true" />
          </span>
        </ListboxButton>
        <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md dark:bg-blue-950 dark:text-amber-50 bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {genderOptions.map(option => (
            <ListboxOption
              key={option.id}
              value={option}
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                  active ? 'bg-indigo-600 text-white  dark:bg-amber-700' : 'text-gray-900 dark:text-amber-200'
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                    {option.name}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 dark:text-amber-50">
                      <CheckIcon className="h-5 w-5" aria-hidden="true" />
                    </span>
                  )}
                </>
              )}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
