import { router } from '@inertiajs/react'
import type { LucideIcon } from 'lucide-react'
import { ChevronDown } from 'lucide-react'
import React, { type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

function isIconComponent(icon: LucideIcon | ReactNode): icon is LucideIcon {
  return (
    typeof icon === 'function' ||
    (typeof icon === 'object' && icon !== null && '$$typeof' in icon)
  )
}

export interface QuickActionOption {
  /** Button/link label (for accessibility). */
  title: string
  /** Shown in a tooltip when hovering the dropdown item. */
  description: string
  /** Icon: Lucide component (e.g. Pencil) or React node. */
  icon: LucideIcon | ReactNode
  /** When true, this action is not rendered. */
  dontShowIf?: boolean
  /** Click handler (use when no href). */
  onClick?: () => void
  /** When set, navigates to this href on select. */
  href?: string
}

interface QuickActionsProps {
  options: QuickActionOption[]
  /** Optional class for the wrapper. */
  className?: string
}

export function QuickActions({ options, className: classNameProp }: QuickActionsProps) {
  const visible = options.filter((opt) => !opt.dontShowIf)

  if (visible.length === 0) return null

  return (
    <div className={classNameProp}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='default' size='md' aria-label='Quick actions'>
            Actions
            <ChevronDown className='h-4 w-4 shrink-0' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='min-w-[200px]'>
          {visible.map((opt) => {
            const iconEl = isIconComponent(opt.icon) ? (
              React.createElement(opt.icon, { className: 'h-4 w-4 shrink-0' })
            ) : (
              <span className={cn('[&_svg]:h-4 [&_svg]:w-4 shrink-0')}>
                {opt.icon}
              </span>
            )

            const handleSelect = () => {
              if (opt.href != null) {
                router.visit(opt.href)
              } else {
                opt.onClick?.()
              }
            }

            const itemContent = (
              <div className='flex items-center gap-2'>
                {iconEl}
                <span className='font-medium'>{opt.title}</span>
              </div>
            )

            return (
              <DropdownMenuItem
                key={`${opt.title}-${opt.href ?? 'action'}`}
                onClick={handleSelect}>
                {opt.description ? (
                  <Tooltip>
                    <TooltipTrigger className='flex w-full cursor-default items-center gap-2 outline-none'>
                      {itemContent}
                    </TooltipTrigger>
                    <TooltipContent side='right'>
                      {opt.description}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  itemContent
                )}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
