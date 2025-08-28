import HomeNavbar from '~/components/HomeNavbar'
import filter from './filter.svg'
import mail from './mail.svg'
import { useNavigate } from 'react-router'

export function NotificationsComponent() {

  const navigate = useNavigate()

  return (
    <main
      className="flex flex-col font-primary items-center bg-gradient-to-b from-orange-300 to-white dark:from-indigo-900 dark:to-gray-800 min-h-screen">
      <HomeNavbar />
      <div
        className="items-center justify-center max-w-[500px] text-lg w-10/12 mt-10 grid gap-5 grid-cols-1">
        <button
          className="group rounded-2xl flex flex-row transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 border-3 px-3 py-3 bg-white hover:bg-orange-100"
          onClick={() => navigate('channels')}
        >
          <h1 className="text-start w-8/12 mt-8 mr-6">Manage Notification Channels</h1>
          <div className="mx-auto">
            <img className='' height={60} width={60}
                 src={mail} />
          </div>
        </button>
        <button
          className="group rounded-2xl flex flex-row transition ease-in-out hover:-translate-y-3 hover:scale-105 border-orange-400 border-3 px-3 py-3 bg-white hover:bg-orange-100"
          onClick={() => navigate('filters')}
        >
          <h1 className="text-start w-8/12 mt-8 mr-6">Notification Filters & Targets</h1>
          <div className="mx-auto items-center justify-center flex">
            <img className='item' height={60} width={60} src={filter} />
          </div>
        </button>
      </div>
    </main>
  )
}