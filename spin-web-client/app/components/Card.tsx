export function Card() {
  return (
    <div className="my-40 bg-white/30 font-primary rounded-3xl mx-auto shadow-2xl">
      <div className="w-full h-full flex lg:flex-row items-center flex-col">
        <img alt="cover" className="lg:w-40 rounded-2xl lg:h-40 h-44 w-44 m-3"
             src='https://i.discogs.com/3jIXeeFG8I_JDCJLzD2WTpatabGHMeHqOBxjJibqU1A/rs:fit/g:sm/q:40/h:150/w:150/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTEzODU1/MDE5LTE2MzYxMjI1/NzctMTA1NC5qcGVn.jpeg' />
        <div className="flex my-auto flex-col mx-auto">
          <h1 className="text-xl pb-2">
            Mac Demarco - Old Dog Demos
          </h1>
          <h1 className="">
            Artist: Mac Demarco
          </h1>
          <div className="flex m-3 flex-row">
            <div className="rounded-4xl bg-slate-300 px-2 py-1">
              Rock
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}