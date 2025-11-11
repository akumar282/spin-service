import { SpinClient } from '~/api/client'

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