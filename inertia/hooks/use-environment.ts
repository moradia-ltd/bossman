import useLocalStorage from './use-local-storage'

export function useEnvironment() {
  const [environment, setEnvironment] = useLocalStorage<'prod' | 'dev'>('appEnv', 'dev')

  return { environment, setEnvironment }
}
