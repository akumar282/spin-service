import React, { type Dispatch, type InputHTMLAttributes, type SetStateAction, useEffect, useState } from 'react'
import { Dropdown, DropdownItem } from 'flowbite-react'
import countries from '../assets/countries.json'
import type { Countries } from '~/types'

interface CountrySelectorProps extends InputHTMLAttributes<HTMLInputElement>{
  setCountryCode: Dispatch<SetStateAction<{ iso: string, dial: string}>>
  countryCode: { iso: string, dial: string}
  countryMap: Map<string, Countries>
  inferredCountry?: string
}

export default function CountrySelector(props: CountrySelectorProps) {
  const [dropdownKey, setDropdownKey] = useState(0)

  useEffect(() => {
    let raf = 0
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setDropdownKey(k => k + 1))
    }

    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className='flex w-full items-center'>
      <div className='relative min-w-0 w-5/12'>
        <Dropdown
          key={dropdownKey}
          placement='bottom-start'
          className='w-full max-w-[calc(100vw-2rem)] overflow-x-hidden rounded-l-lg rounded-r-none dark:bg-slate-500'
          renderTrigger={() => (
            <button
              type='button'
              className='w-full h-10 px-2 flex items-center flex bg-white border border-slate-500 rounded-l-lg rounded-r-none'
            >
              <span className='min-w-0 truncate'>{props.countryCode.dial}</span>
              <img height={13.5} width={24} src={props.countryMap.get(props.countryCode.iso)?.flag} className='shrink-0 ml-2'/>
              <span className='shrink-0 ml-auto'>▾</span>
            </button>
          )}
        >
          <div className='max-h-60 overflow-y-auto overflow-x-hidden'>
            {countries.map((x: Countries, key) => (
              <DropdownItem
                key={key}
                className='h-10 flex items-center gap-2 px-2 w-full min-w-0 overflow-hidden'
                onClick={() => props.setCountryCode({ iso: x.isoCode, dial: x.dialCode })}
              >
                <span className='sr-only hidden'>
                  {x.name}
                </span>
                <img height={9} width={16} src={x.flag} className='shrink-0'/>
                <span className='flex-1 text-start min-w-0 truncate whitespace-nowrap'>
                  {x.dialCode}
                </span>
                <span className='flex-1 min-w-0 text-end truncate whitespace-nowrap'>
                  {x.name}
                </span>
              </DropdownItem>
            ))}
          </div>
        </Dropdown>
      </div>
      <div className='min-w-0 flex-1'>
        <input
          className='bg-white my-2 w-full h-10 py-1 text-black text-base rounded-r-lg rounded-l-none border pl-2 border-slate-500'
          type='text'
          name='phone'
          id='phone'
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
        />
      </div>
    </div>
  )
}
