import { useNavigate } from 'react-router'

export default function Navbar() {

  const navigate = useNavigate()

  return (
    <nav className="relative px-4 py-4 flex justify-start items-center dark:bg-indigo-800 bg-orange-300">
      <button onClick={() => navigate('/')}>
        <h1 className="font-primary text-2xl">
          spin-service
        </h1>
      </button>
    </nav>
  )
}