import React from 'react'
import { Link } from 'react-router'

interface Mailto {
  mailto: string,
  label: string,
}

export default function ButtonMailto(props: Mailto) {
  return (
    <Link
      className='font-primary underline text-secondary-blue'
      to='#'
      onClick={(e) => {
        window.location.href = props.mailto
        e.preventDefault()
      }}
    >
      {props.label}
    </Link>
  )
}