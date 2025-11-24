import { SpinClient } from '~/api/client'
import { unwrap, type UpdateUser } from '~/types'
import { AuthContext, type AuthContextType } from '~/components/AuthContext'
import { useContext } from 'react'

export async function SignUp(username: string, password: string, type: 'login' | 'new_user'): Promise<200 | 400 | 401> {
  const client = new SpinClient()
  const result = await client.postData('/public/auth', {
    type: type,
    platform: 'web',
    credentials: {
      username: username,
      password: password
    },
    clientId: import.meta.env.VITE_CLIENT_ID
  })

  if (result.data === 'Login Successful') {
    return 200
  } else {
    return 401
  }
}

export async function updateUser(context: AuthContextType | null, client: SpinClient, payload: object ) {
  if (context && context.user?.data) {
    unwrap(await client.patchData<UpdateUser>(`public/user/${context?.user?.sub}`, payload))
    await client.postData<string>('/public/refresh', { platform: 'web' })
    context.update()
  }
}

export function cap(inputString: string): string {
  if (!inputString) {
    return inputString
  }
  const list = inputString.split(' ')
  let lowercase = ''
  list.forEach((word) => lowercase += (word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() + ' '))
  return lowercase
}

export function useTriggerOut() {
  const context = useContext(AuthContext)
  if (context) {
    return () => context.logOut()
  }
}