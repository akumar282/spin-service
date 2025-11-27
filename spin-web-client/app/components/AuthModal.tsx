import React from 'react'
import { Modal, ModalBody, ModalHeader } from 'flowbite-react'
import SignUpForm from '~/components/SignUpForm'

interface ModalProps {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function AuthModal(props: ModalProps) {

  return (
    <Modal show={props.open} onClose={() => props.setOpen(false)}>
      <ModalHeader className='font-primary'>
        <h1 className='text-2xl text-center mx-auto'>
          Create an Account to Continue
        </h1>
      </ModalHeader>
      <ModalBody className='font-primary'>
        <SignUpForm/>
      </ModalBody>
    </Modal>
  )
}