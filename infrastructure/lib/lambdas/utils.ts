export function getEnv(name: string): string {
  const val = process.env[name]
  if (!val) {
    throw new Error('Error: AppSyncKey not defined')
  }
  return val
}
