import { SpinClient } from '~/api/client'
import { unwrap, type UpdateUser } from '~/types'
import type { AuthContextType } from '~/components/AuthContext'

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

export async function refreshUser() {
  const client = new SpinClient()
  const result = await client.postData<string>('/public/refresh')
}

export async function updateUser(context: AuthContextType | null, client: SpinClient, payload: object ) {
  if (context && context.user?.data) {
    console.log(payload)
    const data = unwrap(await client.patchData<UpdateUser>(`public/user/${context?.user?.sub}`, payload))
    const result = await client.postData<string>('/public/refresh', { platform: 'web' })
    context.update()
  }
}