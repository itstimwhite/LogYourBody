import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const commonDomains = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "icloud.com",
  "hotmail.com",
];

const domainCorrections: Record<string, string> = {
  "gmil.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gnail.com": "gmail.com",
  "yhoo.com": "yahoo.com",
  "hotnail.com": "hotmail.com",
};

const disposableDomains = [
  "tempmail.com",
  "mailinator.com",
  "10minutemail.com",
];

export interface EmailInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (value: string) => void;
  multiple?: boolean;
}

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ value, onChange, className, multiple, ...props }, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    const getCurrentPart = () => {
      const parts = value.split(/[;,]/);
      return parts[parts.length - 1].trim();
    };

    const currentPart = getCurrentPart();
    const atIndex = currentPart.indexOf("@");
    const local = atIndex >= 0 ? currentPart.slice(0, atIndex) : currentPart;
    const domainInput = atIndex >= 0 ? currentPart.slice(atIndex + 1) : "";

    const suggestedDomains = domainInput
      ? commonDomains.filter((d) =>
          d.startsWith(domainInput.toLowerCase()),
        )
      : [];

    const typoCorrection = domainCorrections[domainInput.toLowerCase()];

    const finalSuggestions = Array.from(
      new Set([
        ...(typoCorrection ? [typoCorrection] : []),
        ...suggestedDomains,
      ]),
    );

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

    const isValidEmail = (val: string) => {
      const emails = val
        .split(/[;,]/)
        .map((e) => e.trim())
        .filter(Boolean);
      return emails.every((e) => emailRegex.test(e));
    };

    const hasDisposable = (val: string) => {
      const emails = val
        .split(/[;,]/)
        .map((e) => e.trim())
        .filter(Boolean);
      return emails.some((e) => {
        const domain = e.split("@")[1]?.toLowerCase();
        return domain ? disposableDomains.includes(domain) : false;
      });
    };

    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    useEffect(() => {
      if (!value) {
        setError(null);
        setWarning(null);
        return;
      }
      if (!isValidEmail(value)) {
        setError("Looks like you're missing the '@' symbol or have invalid characters");
      } else {
        setError(null);
        setWarning(
          hasDisposable(value)
            ? "Disposable email domains may not be supported"
            : null,
        );
      }
    }, [value]);

    const applySuggestion = (domain: string) => {
      const parts = value.split(/[;,]/);
      parts[parts.length - 1] = (atIndex >= 0 ? local + "@" : "") + domain;
      const newVal = parts.join(", ");
      onChange(newVal);
      setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (showSuggestions && finalSuggestions.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setHighlightedIndex((highlightedIndex + 1) % finalSuggestions.length);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setHighlightedIndex(
            (highlightedIndex - 1 + finalSuggestions.length) %
              finalSuggestions.length,
          );
        } else if (e.key === "Enter") {
          e.preventDefault();
          applySuggestion(finalSuggestions[highlightedIndex]);
        }
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
      setShowSuggestions(true);
    };

    const handleBlur = () => {
      setTimeout(() => setShowSuggestions(false), 100);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="email"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? "email-error" : undefined}
          autoComplete="email"
          pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
          role="textbox"
          {...props}
          className={cn(
            "flex h-10 w-full rounded-lg border border-linear-border bg-linear-card px-3 py-2 text-base text-linear-text placeholder:text-linear-text-tertiary transition-all duration-200 focus:border-linear-purple focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-red-500 focus:border-red-500",
            className,
          )}
        />
        {showSuggestions && finalSuggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 max-h-40 w-full overflow-auto rounded-md border border-linear-border bg-linear-card text-sm shadow-md">
            {finalSuggestions.map((d, i) => (
              <li
                key={d}
                onMouseDown={() => applySuggestion(d)}
                className={cn(
                  "cursor-pointer px-3 py-1",
                  i === highlightedIndex && "bg-linear-border/50",
                )}
              >
                {atIndex >= 0 ? `${local}@${d}` : d}
              </li>
            ))}
          </ul>
        )}
        {error && (
          <p id="email-error" className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        {!error && warning && (
          <p className="mt-1 text-sm text-yellow-600">{warning}</p>
        )}
      </div>
    );
  },
);
EmailInput.displayName = "EmailInput";

export { EmailInput };
