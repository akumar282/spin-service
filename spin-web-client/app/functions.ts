import { SpinClient } from '~/api/client'
import type { AuthResponse } from '~/types'

export async function SignUp(username: string, password: string, type: 'login' | 'new_user'): Promise<200 | 400 | 401> {
  const client = new SpinClient()
  const result = await client.postData<AuthResponse>('/public/auth', {
    type: type,
    platform: 'web',
    credentials: {
      username: username,
      password: password
    },
    clientId: import.meta.env.VITE_CLIENT_ID
  })

  if (result.status === 200) {
    return 200
  } else {
    return 401
  }
}