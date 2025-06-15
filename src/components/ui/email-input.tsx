import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

export interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  suggestions?: string[]
  warnDisposable?: boolean
}

const defaultSuggestions = [
  "gmail.com",
  "outlook.com",
  "yahoo.com",
  "icloud.com",
  "hotmail.com",
]
const disposableDomains = ["mailinator.com", "tempmail.com", "10minutemail.com"]

const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, suggestions = defaultSuggestions, warnDisposable = true, ...props }, ref) => {
    const [value, setValue] = React.useState(props.value?.toString() ?? "")
    const [showList, setShowList] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    const updateValue = (val: string) => {
      setValue(val)
      if (props.onChange) {
        // create synthetic event for external handler
        const event = {
          ...new Event("input", { bubbles: true }),
          target: { value: val }
        } as unknown as React.ChangeEvent<HTMLInputElement>
        props.onChange(event)
      }
    }

    const validate = (email: string) => {
      if (!email.includes("@")) return "Looks like you’re missing the ‘@’ symbol"
      const domain = email.split("@")[1] || ""
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u
      if (!emailRegex.test(email)) return "Invalid email address"
      if (warnDisposable && disposableDomains.includes(domain)) {
        return "Disposable email addresses are not allowed"
      }
      return null
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      updateValue(val)
      setError(validate(val))
      setShowList(true)
    }

    const applySuggestion = (domain: string) => {
      const local = value.split("@")[0]
      const val = `${local}@${domain}`
      updateValue(val)
      setError(validate(val))
      setShowList(false)
    }

    const suggestionMatches = React.useMemo(() => {
      const domainPart = value.split("@")[1] ?? ""
      return suggestions.filter((d) => d.startsWith(domainPart))
    }, [value, suggestions])

    const localPart = value.split("@")[0]
    const domainPart = value.includes("@") ? value.split("@")[1] : ""

    return (
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 flex items-center px-3 py-2 text-sm">
          <span className="text-blue-600">{localPart}</span>
          {value.includes("@") && <span className="text-gray-400">@</span>}
          <span className="text-green-600">{domainPart}</span>
        </div>
        <Input
          {...props}
          ref={ref}
          type="text"
          role="textbox"
          aria-label="Email"
          aria-invalid={error ? "true" : "false"}
          value={value}
          onChange={handleChange}
          onFocus={() => setShowList(true)}
          onBlur={(e) => {
            setShowList(false)
            props.onBlur?.(e)
          }}
          className={cn("text-transparent caret-current", className)}
          autoComplete="email"
        />
        {showList && suggestionMatches.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-white text-sm shadow-md"
          >
            {suggestionMatches.map((s) => (
              <li
                key={s}
                role="option"
                className="cursor-pointer px-3 py-1 hover:bg-gray-100"
                onMouseDown={(e) => {
                  e.preventDefault()
                  applySuggestion(s)
                }}
              >
                {localPart}@{s}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
EmailInput.displayName = "EmailInput"
export { EmailInput }
