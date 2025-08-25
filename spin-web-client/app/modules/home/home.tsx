import { Card } from '~/components/Card'

export function Home() {
  return (
    <main className="flex flex-col bg-gradient-to-tl items-center from-lime-200 via-sky-200 to-indigo-300 min-h-screen">
      <div className="items-center justify-center w-11/12 grid lg:grid-cols-3 gap-3 grid-cols-1">
        <Card/>
        <Card/>
        <Card/>
      </div>
    </main>
  )
}