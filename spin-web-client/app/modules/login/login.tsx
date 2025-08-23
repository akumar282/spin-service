import Navbar from '~/components/Navbar'

export function LoginComponent() {

  return (
    <main>
      <Navbar/>
      <div className="font-primary bg-orange-100 min-h-dvh w-full flex dark:bg-slate-900">
        <div className="flex-1 flex flex-col items-center">
          <div>
            <h1>
              Get Started
            </h1>
          </div>
        </div>
      </div>
    </main>

  )
}