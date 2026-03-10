'use client'

import { useState, useEffect } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function SetupBanner() {
  const [needsSetup, setNeedsSetup] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const response = await fetch('/api/init', {
          method: 'GET',
        })
        const data = await response.json()
        
        if (data.status === 'needs_setup') {
          setNeedsSetup(true)
        }
      } catch (error) {
        console.log('[setup-banner] Could not check setup status:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkSetup()
  }, [])

  if (isChecking || !needsSetup) {
    return null
  }

  return (
    <Alert className="border-yellow-600 bg-yellow-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Setup Required</AlertTitle>
      <AlertDescription className="text-yellow-700 space-y-2">
        <p>The database needs to be initialized before you can use the blog features.</p>
        <Button asChild variant="outline" size="sm" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
          <Link href="/setup">Initialize Database</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
