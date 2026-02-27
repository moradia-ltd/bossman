import type { ReactNode } from 'react'

export interface ConditionalShowProps {
  condition: boolean
  children: ReactNode
  fallback?: ReactNode
}

export const OnlyShowIf = ({ condition, children, fallback = null }: ConditionalShowProps) => {
  if (condition) {
    return <>{children}</>
  }
  return <>{fallback}</>
}

OnlyShowIf.displayName = 'OnlyShowIf'
