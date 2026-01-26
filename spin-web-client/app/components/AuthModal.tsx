import React, { useState } from 'react'
import { Modal, ModalBody, ModalHeader } from 'flowbite-react'
import SignUpForm from '~/components/SignUpForm'
import { useNavigate } from 'react-router'
import Alert from '~/components/Alert'

interface ModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AuthModal(props: ModalProps) {
  const navigate = useNavigate()

  const [show, setShow] = useState<boolean>(false)
  const [message, setMessage] =
    useState<{ title: string, message: string, type: string }>({ title: '', message: '', type: '' })
  
  return (
    <Modal show={props.open} onClose={() => props.setOpen(false)}>
      <ModalHeader className='font-primary'>
        <h1 className='text-2xl text-center mx-auto'>
          Create an Account to Continue
        </h1>
      </ModalHeader>
      <ModalBody className='font-primary flex flex-col justify-center'>
        <div className='mt-4 w-full flex justify-center'>
          <Alert show={show} closeAlert={() => setShow(false)} title={message.title} message={message.message}
                 type={message.type}/>
        </div>
        <SignUpForm flow={'new_user'} setMessage={setMessage} setShow={setShow}/>
        <h1 className='font-primary text-center pt-5'>Already have an account?
          <button
            type='button'
            onClick={() => navigate({ pathname: '/login' })}
            className='underline text-secondary-blue ml-2 hover:text-indigo-400 '>Log In
          </button>
        </h1>
      </ModalBody>
    </Modal>
  )
}