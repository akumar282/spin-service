import React, {useState} from 'react'
import plus from './assets/plus.svg'

export interface ResultComponentProps {
  _typename: 'release' | 'master'
  title: string
  subtitle: string
  thumbnail: string
  linkTo?: string
  data: object
  year: string
  format: string[]
  buttonFunction: () => void
}

export interface ArtistResultComponentProps {
  _typename: 'artist'
  title: string
  subtitle: string
  thumbnail: string
  linkTo?: string
  data: object
  buttonFunction: () => void
}

const alternateImage = 'https://media.tenor.com/sovVS54egH0AAAAm/sorry.webp'

export function ResultComponent(props: ResultComponentProps) {

  const [checked, setChecked] = useState<boolean>(false)

  return (
    <div className='w-[99%] justify-between my-0.5 rounded dark:bg-slate-300 dark:text-black dark:border-indigo-600 rounded-xl bg-white flex flex-row border border-slate-400 items-stretch'>
      <div className='flex flex-row'>
        <div className='flex items-center justify-center lg:m-3 m-3'>
          <div className='h-[64px] w-[64px] lg:w-[70px] lg:h-[70px] flex-shrink-0'>
            <img
              className='h-full w-full object-cover rounded'
              src={props.thumbnail !== '' ? props.thumbnail : alternateImage}
              alt='title'
            />
          </div>
        </div>
        <div className='lg:m-5 m-2 flex flex-col'>
          <h1 className='text-lg'>
            {props.title}
          </h1>
          <h3 className='text-sm italic text-wrap'>
            {props._typename.charAt(0).toUpperCase() + props._typename.slice(1)}, {props.year},
            Format: {props.format[0]}
          </h3>
          <h3 className='text-sm text-blue-700 mt-1'>
            <a target='_blank' title={'View on Discogs'} href={'https://discogs.com' + props.linkTo} rel='noreferrer'>View
              on Discogs</a>
          </h3>
        </div>
      </div>
      <button className='lg:mr-5 mr-2 my-auto'onClick={() => (props.buttonFunction(), setChecked(true))}>
        <div className='h-10 w-10'>
          {checked ? ( <img src={plus} alt='Plus'/> ) : (
            <svg
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 22 22'
              stroke='currentColor'
              className='flex-shrink-0 inline w-4 h-4 ml-1 mt-1 mb-1'
            >
              <path d='M6 18L18 6M6 6l12 12'></path>
            </svg>
          )}
        </div>
      </button>
    </div>
  )
}

export function ArtistResultComponent(props: ArtistResultComponentProps) {

  const [checked, setChecked] = useState<boolean>(false)

  return (
    <div
      className='w-[99%] justify-between my-0.5 rounded rounded-xl dark:bg-slate-300 dark:text-black dark:border-indigo-600 bg-white flex flex-row border border-slate-400'>
      <div className='flex flex-row'>
        <div className='flex items-center justify-center lg:m-3 m-3'>
          <div className='h-[64px] w-[64px] lg:w-[70px] lg:h-[70px] flex-shrink-0'>
            <img
              className='h-full w-full object-cover rounded'
              src={props.thumbnail !== '' ? props.thumbnail : alternateImage}
              alt='title'
            />
          </div>
        </div>
        <div className='lg:m-5 m-2 flex flex-col'>
          <h1 className='text-lg'>
            {props.title}
          </h1>
          <h3 className='text-sm italic'>
            {props._typename.charAt(0).toUpperCase() + props._typename.slice(1)}
          </h3>
          <h3 className='text-sm text-blue-700 mt-1'>
            <a target='_blank' title={'View on Discogs'} href={'https://discogs.com' + props.linkTo} rel='noreferrer'>View
              on Discogs</a>
          </h3>
        </div>
      </div>
      <button className='lg:mr-5 mr-2 my-auto' onClick={() => (props.buttonFunction(), setChecked(true))}>
        <div className='h-10 w-10'>
          {checked ? (<img src={plus} alt='Plus'/>) : (
            <svg
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 22 22'
              stroke='currentColor'
              className='flex-shrink-0 inline w-4 h-4 ml-1 mt-1 mb-1'
            >
              <path d='M6 18L18 6M6 6l12 12'></path>
            </svg>
          )}
        </div>
      </button>
    </div>
  )
}