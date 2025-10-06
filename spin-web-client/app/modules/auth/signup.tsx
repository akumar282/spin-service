import Navbar from '~/components/Navbar'
import OAuthButtons from '~/components/OAuthButton'
import google from './assets/google.svg'
import orline from './assets/orline.png'
import React, { useState } from 'react'
import { useNavigate } from 'react-router'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { SignUp } from '~/functions'

export function SignUpComponent() {

  const [isChecked, setIsChecked] = useState(false)
  const navigate = useNavigate()

  const handleCheck = () => {
    setIsChecked(!isChecked)
  }
  const validationSchema = yup.object({
    username: yup
      .string()
      .min(3, 'Username should be of minimum 3 characters')
      .max(20, 'Username should be of maximum 20 characters')
      .required('Username is required'),
    password: yup
      .string()
      .min(8, 'Password should be of minimum 8 characters')
      .required('Password is required'),
  })

  const formik = useFormik({
    initialValues: {
      username: '',
      password:''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const result = await SignUp(values.username, values.password, 'new_user')
      console.log(result)
    },
  })



  return (
    <main>
      <div className='font-primary flex flex-col bg-orange-100 h-dvh w-full flex dark:bg-slate-900'>
        <Navbar />
        <div className='flex-1 flex flex-col items-center text-center lg:flex-col'>
          <div className='mt-4 space-y-4 justify-center'>
            <div className='pt-10 flex flex-col items-center justify-center'>
              <h1 className='text-center font-secondary text-4xl font-light'>Get Started</h1>
              <h2 className='text-center text-lg text-medium font-primary pt-4'>Create an account</h2>
              <OAuthButtons onClick={() => console.log('hello')}
                            label='Sign up with Google' src={google} />
            </div>
            <div className='py-4 flex items-center justify-center'>
              <img className='w-20 sm:w-20 md:w-32 lg:w-40' src={orline} alt='or line' />
              <h1 className='px-4 font-primary text-lg'>or</h1>
              <img className='w-20 sm:w-20 md:w-32 lg:w-40' src={orline} alt='or line' />
            </div>
            <form className='mt-6' onSubmit={formik.handleSubmit}>
              <div className='flex flex-col space-y-3 items-center'>
                <div>
                  <input
                    className='my-1 lg:w-[23rem] w-[20rem] bg-white text-start py-1 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-400 dark:focus:outline-2'
                    placeholder='Email or Phone'
                    name='username'
                    type='text'
                    id='username'
                    value={formik.values.username}
                    onChange={formik.handleChange}
                  />
                </div>
                <div>
                  <input
                    className='my-1 lg:w-[23rem] w-[20rem] bg-white text-start py-1 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-400 dark:focus:outline-2'
                    placeholder='Password'
                    name='password'
                    type='password'
                    id='password'
                    value={formik.values.password}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>
              <div className='mx-auto justify-center py-4'>
                <input type='radio' onChange={() => console.log()} checked={isChecked} onClick={handleCheck}></input>
                <label className='pl-2 font-primary text-sm'>I agree to the
                  <a onClick={() => navigate('/tos')}
                     className='underline text-secondary-blue ml-2 hover:text-indigo-400 cursor-pointer'>Terms
                  and Conditions</a> </label>
              </div>
              <div className='pt-2 flex flex-col items-center'>
                <button
                  className='font-primary bg-orange-300 dark:bg-indigo-400 transition ease-in-out dark:hover:scale-105 hover:bg-indigo-600 text-white text-lg rounded-lg lg:px-38 px-32 py-2'
                  type='submit'
                  // onClick={() => formik.handleSubmit}
                >
                  <h1 className='w-full'>Log In</h1>
                </button>
                <h1 className='font-primary text-center pt-5'>Already have an account?
                  <button
                    type='button'
                    onClick={() => navigate({ pathname: '/login' })}
                    className='underline text-secondary-blue ml-2 hover:text-indigo-400 '>Log In
                  </button>
                </h1>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}