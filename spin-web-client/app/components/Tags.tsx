import React, {type ButtonHTMLAttributes } from 'react'

interface TagButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean
  title: string
  format?: string
}

export function Tags(props: TagButton) {
  return (
    <button className={props.className} onClick={props.onClick}>
      <div className='flex flex-row'>
        <h3>
          {props.title}
        </h3>
        {props.checked && (
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
  )
}