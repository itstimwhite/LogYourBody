'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Check, AlertCircle } from 'lucide-react'

interface SmartEmailInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  onValidationChange?: (isValid: boolean) => void
  showSuggestions?: boolean
  maskOnBlur?: boolean
}

const commonDomains = [
  'gmail.com',
  'yahoo.com',
  'outlook.com',
  'hotmail.com',
  'icloud.com',
  'aol.com',
  'protonmail.com',
  'me.com',
  'mac.com',
]

const domainCorrections: Record<string, string> = {
  'gmial.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'outloo.com': 'outlook.com',
  'outlok.com': 'outlook.com',
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'iclould.com': 'icloud.com',
  'icoud.com': 'icloud.com',
}

const disposableDomains = [
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'throwaway.email',
]

export function SmartEmailInput({
  value,
  onChange,
  onValidationChange,
  showSuggestions = true,
  maskOnBlur = false,
  className,
  ...props
}: SmartEmailInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showDomainSuggestions, setShowDomainSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1)
  const [validation, setValidation] = useState<{
    isValid: boolean
    message?: string
    type?: 'error' | 'warning'
  }>({ isValid: true })
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Parse email parts
  const atIndex = value.indexOf('@')
  const localPart = atIndex > -1 ? value.substring(0, atIndex) : value
  const domainPart = atIndex > -1 ? value.substring(atIndex + 1) : ''

  // Get domain suggestions
  const getDomainSuggestions = useCallback(() => {
    if (!domainPart || domainPart.length === 0) return commonDomains
    
    const lowercaseDomain = domainPart.toLowerCase()
    
    // Check for typos first
    if (domainCorrections[lowercaseDomain]) {
      return [domainCorrections[lowercaseDomain]]
    }
    
    // Filter common domains
    return commonDomains.filter(domain => 
      domain.toLowerCase().startsWith(lowercaseDomain) && domain !== lowercaseDomain
    )
  }, [domainPart])

  const suggestions = getDomainSuggestions()

  // Validate email
  useEffect(() => {
    const validateEmail = () => {
      // No @ symbol
      if (!value.includes('@') && value.length > 3) {
        setValidation({
          isValid: false,
          message: "Missing '@' symbol",
          type: 'error'
        })
        onValidationChange?.(false)
        return
      }

      // Multiple @ symbols
      if ((value.match(/@/g) || []).length > 1) {
        setValidation({
          isValid: false,
          message: 'Only one @ symbol allowed',
          type: 'error'
        })
        onValidationChange?.(false)
        return
      }

      // Empty local or domain part
      if (atIndex > -1) {
        if (localPart.length === 0) {
          setValidation({
            isValid: false,
            message: 'Email username is required',
            type: 'error'
          })
          onValidationChange?.(false)
          return
        }

        if (domainPart.length === 0) {
          setValidation({
            isValid: false,
            message: 'Domain is required after @',
            type: 'error'
          })
          onValidationChange?.(false)
          return
        }

        // Check for disposable email
        if (disposableDomains.some(d => domainPart.toLowerCase().includes(d))) {
          setValidation({
            isValid: true,
            message: 'Temporary email addresses are not recommended',
            type: 'warning'
          })
          onValidationChange?.(true)
          return
        }

        // Basic domain validation
        if (!domainPart.includes('.') && domainPart.length > 2) {
          setValidation({
            isValid: false,
            message: 'Domain should include a dot (e.g., gmail.com)',
            type: 'error'
          })
          onValidationChange?.(false)
          return
        }
      }

      // Valid or still typing
      if (value.length === 0 || (atIndex > -1 && domainPart.includes('.'))) {
        setValidation({ isValid: true })
        onValidationChange?.(true)
      } else {
        setValidation({ isValid: true })
        onValidationChange?.(false)
      }
    }

    validateEmail()
  }, [value, atIndex, localPart, domainPart, onValidationChange])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDomainSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
        break
      case 'Enter':
      case 'Tab':
        if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
          e.preventDefault()
          onChange(`${localPart}@${suggestions[selectedSuggestion]}`)
          setShowDomainSuggestions(false)
        }
        break
      case 'Escape':
        setShowDomainSuggestions(false)
        setSelectedSuggestion(-1)
        break
    }
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    
    // Show suggestions when @ is typed
    if (newValue.includes('@') && !value.includes('@')) {
      setShowDomainSuggestions(true)
    }
    
    // Hide suggestions when domain is complete
    if (newValue.includes('@') && newValue.split('@')[1]?.includes('.')) {
      setShowDomainSuggestions(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (domain: string) => {
    onChange(`${localPart}@${domain}`)
    setShowDomainSuggestions(false)
    inputRef.current?.focus()
  }

  // Mask email on blur if requested
  const displayValue = maskOnBlur && !isFocused && value.includes('@')
    ? `${localPart.substring(0, 2)}***@${domainPart}`
    : value

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="email"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true)
            if (atIndex > -1 && !domainPart.includes('.')) {
              setShowDomainSuggestions(true)
            }
          }}
          onBlur={() => {
            setIsFocused(false)
            // Delay to allow clicking suggestions
            setTimeout(() => setShowDomainSuggestions(false), 200)
          }}
          aria-invalid={!validation.isValid}
          aria-describedby={validation.message ? 'email-error' : undefined}
          className={cn(
            'pr-10',
            !validation.isValid && validation.type === 'error' && 'border-red-500 focus:ring-red-500',
            validation.type === 'warning' && 'border-yellow-500 focus:ring-yellow-500',
            className
          )}
          {...props}
        />
        
        {/* Validation icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {value && validation.isValid && !validation.message && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          {validation.message && (
            <AlertCircle className={cn(
              'h-4 w-4',
              validation.type === 'error' ? 'text-red-500' : 'text-yellow-500'
            )} />
          )}
        </div>
      </div>

      {/* Validation message */}
      {validation.message && (
        <p 
          id="email-error"
          className={cn(
            'mt-1 text-sm',
            validation.type === 'error' ? 'text-red-600' : 'text-yellow-600'
          )}
        >
          {validation.message}
        </p>
      )}

      {/* Domain suggestions */}
      {showSuggestions && showDomainSuggestions && suggestions.length > 0 && atIndex > -1 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto"
          role="listbox"
          aria-label="Email domain suggestions"
        >
          {suggestions.map((domain, index) => (
            <button
              key={domain}
              type="button"
              onClick={() => handleSuggestionClick(domain)}
              className={cn(
                'w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
                selectedSuggestion === index && 'bg-gray-100'
              )}
              role="option"
              aria-selected={selectedSuggestion === index}
            >
              <span className="text-gray-600">{localPart}@</span>
              <span className="font-medium">{domain}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}