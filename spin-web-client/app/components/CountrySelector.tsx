import React, { type Dispatch, type InputHTMLAttributes, type SetStateAction } from 'react'
import { Dropdown, DropdownItem } from 'flowbite-react'
import countries from '../assets/countries.json'
import type { Countries } from '~/types'

interface CountrySelectorProps extends InputHTMLAttributes<HTMLInputElement>{
  setCountryCode: Dispatch<SetStateAction<{ iso: string, dial: string}>>
  countryCode: { iso: string, dial: string}
  countryMap: Map<string, Countries>
  inferredCountry?: string
}

export default function CountrySelector() {
  return (
    <div className='flex w-full items-center'>
      {/* left side */}
      <div className='relative min-w-0 w-5/12'>
        <Dropdown
          placement='bottom-start'
          // this className applies to the floating menu
          className='max-w-[calc(100vw-1rem)] w-screen sm:w-full overflow-x-hidden rounded-l-lg rounded-r-none dark:bg-slate-500'
          renderTrigger={() => (
            <button
              type='button'
              className='w-full h-10 px-2 flex items-center justify-between bg-white border border-slate-500 rounded-l-lg rounded-r-none'
            >
              <span className='min-w-0 truncate'>Select</span>
              <span className='shrink-0'>▾</span>
            </button>
          )}
        >
          <div className='max-h-60 overflow-y-auto overflow-x-hidden'>
            {countries.map((x: Countries, key) => (
              <DropdownItem
                key={key}
                className='h-10 flex items-center gap-2 px-2 w-full min-w-0 overflow-hidden'
              >
                <img height={9} width={16} src={x.flag} className='shrink-0' />
                <span className='flex-1 min-w-0 truncate whitespace-nowrap'>
                  {x.name}
                </span>
              </DropdownItem>
            ))}
          </div>
        </Dropdown>
      </div>

      {/* right side */}
      <div className='min-w-0 flex-1'>
        <input
          type='tel'
          className='bg-white my-2 w-full h-10 py-1 text-black text-base rounded-r-lg rounded-l-none border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-400 dark:focus:outline-2'
        />
      </div>
    </div>
  )
}
