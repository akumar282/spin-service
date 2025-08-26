import { Card } from '~/components/Card'
import vinyl from './vinyl.svg'
import alarm from './alarm.svg'
import HomeNavbar from '~/components/HomeNavbar'

export function Home() {
  return (
    <main className="flex flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white min-h-screen">
      <HomeNavbar />
      <div className="items-center justify-center max-w-[1500px] text-lg w-10/12 mt-10 grid gap-5 grid-cols-1 lg:grid-cols-3">
        <button className="rounded-2xl flex flex-row transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 border-3 px-3 py-3 bg-white">
          <h1 className="text-start w-8/12 mt-8 mr-2">Manage Notifications</h1>
          <div className="mx-auto">
            <img height={60} width={60} src={alarm} />
          </div>
        </button>
        <button className="rounded-2xl flex flex-row transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 border-3 px-3 py-3 bg-white">
          <h1 className="text-start w-8/12 mt-8 mr-2">Browse Latest Releases</h1>
          <div className="mx-auto">
            <img height={60} width={60} src={vinyl} />
          </div>
        </button>
        <button className="rounded-2xl flex flex-row transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 border-3 px-3 py-3 bg-white">
          <h1 className="text-start w-8/12 mt-8 mr-2">Browse Latest Releases</h1>
          <div className="mx-auto">
            <img height={60} width={60} src={vinyl} />
          </div>
        </button>
      </div>
      {/*<h1>*/}
      {/*  Recent Releases*/}
      {/*</h1>*/}
      {/*<div className="items-center justify-center max-w-[1500px] w-10/12 mt-4 grid gap-5 grid-cols-1 lg:grid-cols-4 md:grid-cols-2">*/}
      {/*  <Card />*/}
      {/*  <Card />*/}
      {/*  <Card />*/}
      {/*  <Card />*/}
      {/*</div>*/}
    </main>
  )
}