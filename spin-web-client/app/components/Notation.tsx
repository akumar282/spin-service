import React from 'react'
import { cap } from '~/functions'

export function Notation(tag: string, preOrder: boolean, size: number) {
  const notations = []
  if (preOrder) {
    notations.push((
      <button className='dark:bg-indigo-300 bg-orange-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
        <h1>
          Preorder
        </h1>
      </button>
    ))
  }
  if (tag !== 'SOLD OUT' && size !== 0) {
    notations.push((
      <>
        <button className='dark:bg-indigo-300 bg-orange-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
          <h1>
            {cap(tag)}
          </h1>
        </button>
      </>
    ))
  } else if (size !== 0) {
    notations.push((
      <button className='dark:bg-indigo-300 bg-orange-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
        <h1>
          New Release
        </h1>
      </button>
    ))
  } else if(preOrder && size === 0) {
    notations.push((
      <>
      </>
    ))
  } else {
    notations.push((
      <button className='dark:bg-indigo-300 bg-orange-300 rounded-full mt-2 ml-2 mb-2 px-2 text-sm'>
        <h1>
          New Release
        </h1>
      </button>
    ))
  }
  return notations
}