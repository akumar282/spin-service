import { Card } from '~/components/Card'
import HomeNavbar from '~/components/HomeNavbar'

export function Home() {
  return (
    <main className="flex flex-col font-primary items-center bg-gradient-to-b from-violet-300 to-white min-h-screen">
      <HomeNavbar />
      <div className="items-center justify-center max-w-[1500px] w-10/12 mt-4 grid gap-5 grid-cols-1 lg:grid-cols-3">
        <div className="rounded-2xl bg-white/75">Manage Notifications</div>
        <div className="rounded-2xl bg-white/75">Browse Latest Releases</div>
        <div className="rounded-2xl bg-white/75">hello</div>
      </div>
      <div className="items-center justify-center max-w-[1500px] w-10/12 mt-4 grid gap-5 grid-cols-1 lg:grid-cols-3 md:grid-cols-2">
        <Card />
        <Card />
        <Card />
      </div>
    </main>
  )
}