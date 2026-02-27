import type { ConditionalShowProps } from './only-show-if'

export type { ConditionalShowProps }

export const DontShowIf = ({ condition, children, fallback = null }: ConditionalShowProps) => {
  if (!condition) {
    return <>{children}</>
  }
  return <>{fallback}</>
}

DontShowIf.displayName = 'DontShowIf'
