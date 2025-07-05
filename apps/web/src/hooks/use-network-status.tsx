import { useEffect, useState } from 'react'
import { toast } from '@/hooks/use-toast'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast({
        title: 'Back Online',
        description: 'Your connection has been restored',
        className: 'bg-green-500/10 border-green-500/20',
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast({
        title: 'You\'re Offline',
        description: 'Some features may be limited',
        className: 'bg-yellow-500/10 border-yellow-500/20',
        duration: 5000,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}