import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { SignUp } from '~/functions'
import { AuthContext } from '~/components/AuthContext'

export default function SignUpForm() {
  const [isChecked, setIsChecked] = useState(false)
  const navigate = useNavigate()
  const auth = useContext(AuthContext)

  const handleCheck = () => {
    setIsChecked(!isChecked)
  }
  const validationSchema = yup.object({
    username: yup
      .string()
      .min(3, 'Username should be of minimum 3 characters')
      .max(40, 'Username should be of maximum 20 characters')
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
      const result = await SignUp(values.username, values.password, 'new_user')
      if (result === 200) {
        auth?.update()
        navigate('/home')
      }
    },
  })

  return (
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
      <div className='mx-auto flex justify-center items-center py-4'>
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
        >
          <h1 className='w-full'>Sign Up</h1>
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
  )
}