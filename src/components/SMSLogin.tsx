'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'
import { 
  Smartphone, 
  ArrowRight, 
  Check,
  AlertCircle,
  Loader2,
  Phone
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SMSLoginProps {
  onSuccess?: () => void
  className?: string
  minimal?: boolean
}

export function SMSLogin({ onSuccess, className, minimal = false }: SMSLoginProps) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'phone' | 'verify'>('phone')
  const [countryCode, setCountryCode] = useState('+1')
  
  const supabase = createClient()

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '')
    
    // Format as US phone number (XXX) XXX-XXXX
    if (countryCode === '+1') {
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
      if (match) {
        const parts = [match[1], match[2], match[3]].filter(Boolean)
        if (parts.length === 0) return ''
        if (parts.length === 1) return parts[0]
        if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`
        return `(${parts[0]}) ${parts[1]}-${parts[2]}`
      }
    }
    
    return cleaned
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhone(formatted)
  }

  const getFullPhoneNumber = () => {
    // Remove formatting for the actual phone number
    const cleaned = phone.replace(/\D/g, '')
    return `${countryCode}${cleaned}`
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const fullPhone = getFullPhoneNumber()
    
    // Validate phone number
    if (countryCode === '+1' && phone.replace(/\D/g, '').length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit US phone number.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: {
          channel: 'sms'
        }
      })

      if (error) throw error

      setStep('verify')
      toast({
        title: "Code sent!",
        description: `We've sent a verification code to ${phone}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit code we sent you.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: getFullPhoneNumber(),
        token: otp,
        type: 'sms'
      })

      if (error) throw error

      toast({
        title: "Success!",
        description: "You've been logged in successfully.",
      })
      
      onSuccess?.()
    } catch (error: any) {
      toast({
        title: "Invalid code",
        description: error.message || "The code you entered is incorrect. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 6) {
      setOtp(value)
    }
  }

  if (minimal) {
    return (
      <div className={cn("space-y-4", className)}>
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-linear-text">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 px-3 py-2 bg-linear-bg border border-linear-border text-linear-text rounded-md"
                  disabled={loading}
                >
                  <option value="+1">+1 US</option>
                  <option value="+44">+44 UK</option>
                  <option value="+61">+61 AU</option>
                  <option value="+91">+91 IN</option>
                </select>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className="flex-1 bg-linear-bg border-linear-border text-linear-text"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !phone}
              className="w-full bg-linear-purple hover:bg-linear-purple/80 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Code
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-linear-text">
                Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOTPChange}
                placeholder="000000"
                className="bg-linear-bg border-linear-border text-linear-text text-center text-2xl tracking-widest"
                disabled={loading}
                required
                autoFocus
                maxLength={6}
              />
              <p className="text-xs text-linear-text-tertiary text-center">
                Enter the 6-digit code sent to {phone}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                }}
                disabled={loading}
                className="flex-1"
              >
                Change Number
              </Button>
              
              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 bg-linear-purple hover:bg-linear-purple/80 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="text-sm text-linear-purple hover:text-linear-purple/80 disabled:opacity-50"
              >
                Didn't receive a code? Resend
              </button>
            </div>
          </form>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("bg-linear-card border-linear-border", className)}>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-linear-purple/10 flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-linear-purple" />
          </div>
          <div>
            <CardTitle className="text-linear-text">Sign in with SMS</CardTitle>
            <CardDescription className="text-linear-text-secondary">
              {step === 'phone' 
                ? 'Enter your phone number to receive a verification code'
                : 'Enter the 6-digit code we sent you'
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-linear-text">
                Phone Number
              </Label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 px-3 py-2 bg-linear-bg border border-linear-border text-linear-text rounded-md"
                  disabled={loading}
                >
                  <option value="+1">+1 US</option>
                  <option value="+44">+44 UK</option>
                  <option value="+61">+61 AU</option>
                  <option value="+91">+91 IN</option>
                </select>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className="flex-1 bg-linear-bg border-linear-border text-linear-text"
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-xs text-linear-text-tertiary">
                We'll send you a verification code via SMS
              </p>
            </div>

            <Alert className="border-linear-border bg-linear-card">
              <AlertCircle className="h-4 w-4 text-linear-text" />
              <AlertDescription className="text-linear-text-secondary text-sm">
                Standard messaging rates may apply. We'll never share your number.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={loading || !phone}
              className="w-full bg-linear-purple hover:bg-linear-purple/80 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Code
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-linear-text">
                Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOTPChange}
                placeholder="000000"
                className="bg-linear-bg border-linear-border text-linear-text text-center text-2xl tracking-widest"
                disabled={loading}
                required
                autoFocus
                maxLength={6}
              />
              <p className="text-xs text-linear-text-tertiary text-center">
                Enter the 6-digit code sent to {phone}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('phone')
                  setOtp('')
                }}
                disabled={loading}
                className="flex-1"
              >
                Change Number
              </Button>
              
              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex-1 bg-linear-purple hover:bg-linear-purple/80 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleSendOTP}
                disabled={loading}
                className="text-sm text-linear-purple hover:text-linear-purple/80 disabled:opacity-50"
              >
                Didn't receive a code? Resend
              </button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}