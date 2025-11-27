import React from 'react'
import EmptyCard from '~/components/EmptyCard'

export default function CardLoader() {
  return (
    <div className='overflow-x-auto rounded-2xl'>
      <div className='flex gap-4 mt-1 pb-2 px-1.5'>
        <EmptyCard/>
        <EmptyCard/>
        <EmptyCard/>
        <EmptyCard/>
        <EmptyCard/>
        <EmptyCard/>
        <EmptyCard/>
        <EmptyCard/>
      </div>
    </div>
  )
}