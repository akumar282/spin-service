import type { Route } from './+types/home'
import React, { useContext } from 'react'
import { useNavigate } from 'react-router'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { SignUp } from '~/functions'
import Navbar from '~/components/Navbar'
import OAuthButtons from '~/components/OAuthButton'
import google from '~/assets/google.svg'
import orline from '~/assets/orline.png'
import { AuthContext } from '~/components/AuthContext'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'login | spin-service' },
    { name: 'login page', content: 'login page' },
  ]
}

export default function Login() {

  const auth = useContext(AuthContext)
  const navigate = useNavigate()

  const validationSchema = yup.object({
    username: yup
      .string()
      .min(3, 'Username should be of minimum 3 characters')
      .max(100, 'Username should be of maximum 20 characters')
      .required('Username is required'),
    password: yup
      .string()
      .min(8, 'Password should be of minimum 8 characters')
      .required('Password is required'),
  })

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      const result = await SignUp(values.username, values.password, 'login')
      if (result === 200) {
        auth?.update()
        navigate('/home')
      }
    },
  })

  return (
    <main>
      <div className='font-primary flex flex-col bg-orange-100 h-dvh w-full flex dark:bg-slate-900'>
        <Navbar />
        <div className='flex-1 flex flex-col items-center text-center lg:flex-col'>
          <div className='mt-8 space-y-4 justify-center'>
            <div className='pt-10 flex flex-col items-center justify-center'>
              <h1 className='text-center font-secondary text-4xl mb-2 font-light'>Welcome Back</h1>
              <OAuthButtons onClick={() => console.log('hello')}
                            label='Login with Google' src={google} />
            </div>
            <div className='py-2 flex items-center justify-center'>
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
              <div className='pt-2 flex flex-col items-center'>
                <button
                  className='font-primary bg-orange-300 dark:bg-indigo-400 transition ease-in-out dark:hover:scale-105 hover:bg-indigo-600 text-white text-lg rounded-lg lg:px-38 px-32 py-2'
                  type='submit'>
                  <h1 className='w-full'>Log In</h1>
                </button>
                <h1 className='font-primary text-center pt-5'>Don&#39;t have an account?
                  <button
                    type='button'
                    onClick={() => navigate('/signup')}
                    className='underline text-secondary-blue ml-2 hover:text-indigo-400 '>Sign Up
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
