'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function SetupPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  const handleInitialize = async () => {
    setIsInitializing(true)
    setStatus('loading')
    setMessage('Initializing database...')

    try {
      const response = await fetch('/api/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Database initialized successfully!')
        setDetails(data)
      } else {
        setStatus('error')
        setMessage(data.message || 'Failed to initialize database')
        setDetails(data)
      }
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsInitializing(false)
    }
  }

  useEffect(() => {
    // Auto-initialize on page load
    handleInitialize()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Database Setup</CardTitle>
          <CardDescription>Initialize your AD Club database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">{message}</p>
              <p className="text-center text-xs text-muted-foreground">
                This may take a minute...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="text-4xl">✅</div>
              </div>
              <p className="text-center font-semibold text-green-600">{message}</p>
              
              {details?.tables && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Created tables:</p>
                  <ul className="space-y-1 ml-4">
                    <li>✓ blog_posts</li>
                    <li>✓ blog_likes</li>
                    <li>✓ blog_comments</li>
                  </ul>
                </div>
              )}

              {details?.next_steps && (
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Next steps:</p>
                  <ul className="space-y-1 ml-4">
                    {details.next_steps.map((step: string, idx: number) => (
                      <li key={idx}>• {step}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/blog">View Blog</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/admin/blog">Create Post</Link>
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="text-4xl">❌</div>
              </div>
              <p className="text-center font-semibold text-red-600">{message}</p>
              
              {details?.details && (
                <div className="p-3 bg-red-50 rounded text-sm text-red-700">
                  {details.details}
                </div>
              )}

              <Button onClick={handleInitialize} className="w-full" disabled={isInitializing}>
                {isInitializing ? 'Retrying...' : 'Retry'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                If initialization continues to fail, please follow the manual setup guide in DATABASE_SETUP.md
              </p>
            </div>
          )}

          {status === 'idle' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to automatically set up your database.
              </p>
              <Button onClick={handleInitialize} className="w-full" disabled={isInitializing}>
                {isInitializing ? 'Initializing...' : 'Initialize Database'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
