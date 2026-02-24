import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { SignUp } from '~/functions'
import { AuthContext } from '~/components/AuthContext'

interface AuthForm {
  flow: 'login' | 'new_user',
  setShow: React.Dispatch<React.SetStateAction<boolean>>
  setMessage: React.Dispatch<React.SetStateAction<{ title: string, message: string, type: string }>>
}

export default function SignUpForm(props: AuthForm) {
  const [isChecked, setIsChecked] = useState(false)
  const [submissionState, setSubmissionState] = useState<boolean>(false)
  const navigate = useNavigate()
  const auth = useContext(AuthContext)

  const handleCheck = () => {
    setIsChecked(!isChecked)
  }
  const validationSchema = yup.object({
    username: yup
      .string()
      .required('Email is required')
      .matches(/[@]/, 'Must be valid email address'),
    password: yup
      .string()
      .min(6, 'Password should be of minimum 6 characters')
      // .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/, 'Must contain at least one special character')
      // .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
      // .matches(/[a-z]/, 'Must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Must contain at least one number')
      .required('Password is required'),
  })

  const formik = useFormik({
    initialValues: {
      username: '',
      password: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setSubmissionState(true)
      const result = await SignUp(values.username, values.password, props.flow)
      if (result === 200) {
        auth?.update()
        props.setShow(true)
        props.setMessage({ title: 'Success', message: 'Welcome!', type: 'success' })
        setSubmissionState(false)
        navigate('/home')
      } else {
        props.setShow(true)
        props.setMessage({ title: 'Error', message: 'Something went wrong :(', type: 'error' })
        setSubmissionState(false)
      }
    },
  })

  return (
    <form className='mt-6' onSubmit={formik.handleSubmit}>
      <div className='flex flex-col space-y-3'>
        <div className='justify-center flex flex-col'>
          <input
            className='my-1 lg:w-[23rem] w-[20rem] mx-auto bg-white text-start py-1 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-400 dark:focus:outline-2'
            placeholder='Email'
            name='username'
            type='text'
            id='username'
            value={formik.values.username}
            onChange={formik.handleChange}
          />
          {formik.errors.username && formik.touched.username ? (
              <div className='text-red-500 text-xs text-start ml-3'>{formik.errors.username}</div>) : null
          }
        </div>
        <div className='justify-center flex flex-col'>
          <input
            className='my-1 lg:w-[23rem] w-[20rem] mx-auto bg-white text-start py-1 text-black text-base rounded-lg border pl-2 border-slate-500 focus:outline-orange-300 dark:focus:outline-indigo-400 dark:focus:outline-2'
            placeholder='Password'
            name='password'
            type='password'
            id='password'
            value={formik.values.password}
            onChange={formik.handleChange}
          />
          {formik.errors.password && formik.touched.password ? (
            <div className='text-red-500 text-xs text-start ml-3'>{formik.errors.password}</div>) : null
          }
        </div>
      </div>
      { props.flow === 'login' ? null : (
        <div className='mx-auto flex justify-center items-center py-4'>
          <input type='radio' onChange={() => console.log()} checked={isChecked} onClick={handleCheck}></input>
          <label className='pl-2 font-primary text-sm'>I agree to the
            <a onClick={() => navigate('/tos')}
               className='underline text-secondary-blue ml-2 hover:text-indigo-400 cursor-pointer'>Terms
              and Conditions</a> </label>
        </div>)}
      <div className={'pt-2 flex flex-col items-center'}>
        <button
          className='font-primary disabled:opacity-50
                  disabled:cursor-not-allowed disabled:hover:bg-orange-300 disabled:dark:hover:bg-indigo-300 bg-orange-300 mt-3 dark:bg-indigo-400 transition ease-in-out dark:hover:scale-105 hover:bg-indigo-600 text-white text-lg rounded-lg lg:px-39 px-33 py-2'
          type='submit'
          disabled={submissionState}
        >
          {props.flow === 'login' ? (<h1 className='w-full'>Login</h1>) : (<h1 className='w-full'>Sign Up</h1>)}
        </button>
      </div>
    </form>
  )
}