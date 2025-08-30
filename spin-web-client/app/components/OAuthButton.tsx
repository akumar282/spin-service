import React from 'react'

interface OAuthButtonsProps {
  label: string
  src: string
  onClick?: any
}

export default function OAuthButtons(props: OAuthButtonsProps) {

  return (
    <button onClick={props.onClick} className='flex flex-row border hover:bg-slate-300 text-black bg-white border-black rounded-lg mt-5 py-2 px-2'>
      <div className='flex items-center'>
        <img src={props.src} alt={props.label} width={24} height={24} className='' />
        <div className='mx-12 lg:mx-19'>{props.label}</div>
      </div>
    </button>
  )
}