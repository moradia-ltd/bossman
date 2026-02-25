import { useCallback, useEffect, useState } from 'react'

import useDisclosure from '@/hooks/use-disclosure'

const SIDEBAR_STORAGE_KEY = 'dashboard-sidebar-open'

function getInitialSidebarState(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY)
    return stored !== null ? JSON.parse(stored) : true
  } catch {
    return true
  }
}

export function useSidebar() {
  const [sidebarOpen, setSidebarOpenState] = useState(getInitialSidebarState)
  const { isOpen: isMobileMenuOpen, open: openMobileMenu, close: closeMobileMenu } = useDisclosure()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(sidebarOpen))
      }
    } catch (error) {
      console.error('Error saving sidebar state to localStorage:', error)
    }
  }, [sidebarOpen])

  const toggleSidebar = useCallback(() => {
    setSidebarOpenState((prev) => !prev)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('dashboard-shell')
    document.body.classList.add('dashboard-shell')
    return () => {
      document.documentElement.classList.remove('dashboard-shell')
      document.body.classList.remove('dashboard-shell')
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        closeMobileMenu()
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [closeMobileMenu])

  const showSectionLabels = sidebarOpen || isMobile

  return {
    isOpen: sidebarOpen,
    isMobile,
    isMobileMenuOpen,
    openMobileMenu,
    closeMobileMenu,
    toggleSidebar,
    showSectionLabels,
  }
}

export default useSidebar
