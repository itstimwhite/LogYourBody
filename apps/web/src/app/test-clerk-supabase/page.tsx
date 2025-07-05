'use client'

import { useUser } from '@clerk/nextjs'
import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestClerkSupabasePage() {
  const { user, isLoaded } = useUser()
  const supabase = useClerkSupabaseClient()
  const [profile, setProfile] = useState<any>(null)
  const [weights, setWeights] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      fetchData()
    }
  }, [isLoaded, user])

  const fetchData = async () => {
    if (!user) return
    
    setLoading(true)
    setError(null)

    try {
      // Test fetching profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile error:', profileError)
        setError(`Profile error: ${profileError.message}`)
      } else {
        setProfile(profileData)
      }

      // Test fetching weights
      const { data: weightsData, error: weightsError } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('logged_at', { ascending: false })
        .limit(5)

      if (weightsError) {
        console.error('Weights error:', weightsError)
        setError(prev => prev ? `${prev}\nWeights error: ${weightsError.message}` : `Weights error: ${weightsError.message}`)
      } else {
        setWeights(weightsData || [])
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError(`Unexpected error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createTestProfile = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName || user.firstName || 'Test User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        setError(`Failed to create profile: ${error.message}`)
      } else {
        setProfile(data)
        await fetchData()
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const addTestWeight = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: user.id,
          weight: 70 + Math.random() * 10,
          weight_unit: 'kg',
          notes: 'Test weight entry',
          logged_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        setError(`Failed to add weight: ${error.message}`)
      } else {
        await fetchData()
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isLoaded) {
    return <div className="p-8">Loading...</div>
  }

  if (!user) {
    return <div className="p-8">Please sign in to test Clerk-Supabase integration</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Clerk-Supabase Integration Test</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Clerk User Info</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
              {JSON.stringify({
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                name: user.fullName || user.firstName
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supabase Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {profile ? (
              <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
                {JSON.stringify(profile, null, 2)}
              </pre>
            ) : (
              <div>
                <p className="mb-4">No profile found</p>
                <Button onClick={createTestProfile} disabled={loading}>
                  Create Test Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weight Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={addTestWeight} disabled={loading} className="mb-4">
              Add Test Weight
            </Button>
            {weights.length > 0 ? (
              <pre className="text-sm overflow-auto bg-gray-100 p-4 rounded">
                {JSON.stringify(weights, null, 2)}
              </pre>
            ) : (
              <p>No weight logs found</p>
            )}
          </CardContent>
        </Card>

        {error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}