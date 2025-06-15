import React, { useEffect, useState } from "react";
import { AsYouType, parsePhoneNumberFromString, getCountryCallingCode } from "libphonenumber-js";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Country {
  code: string;
  name: string;
}

const countries: Country[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
];

function flagEmoji(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (c) =>
      String.fromCodePoint(127397 + c.charCodeAt(0))
    );
}

export interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (valid: boolean) => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  id = "phone",
  value,
  onChange,
  onValidChange,
}) => {
  const [country, setCountry] = useState<Country>(countries[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const locale = navigator.language || "en-US";
    const code = locale.split("-")[1];
    const found = countries.find((c) => c.code === code);
    if (found) setCountry(found);
  }, []);

  useEffect(() => {
    const phoneNumber = parsePhoneNumberFromString(value, country.code as any);
    const valid = !!phoneNumber?.isValid();
    onValidChange?.(valid);
    if (!value) {
      setError(null);
    } else if (!valid) {
      setError("Looks short—add one more digit");
    } else {
      setError(null);
    }
  }, [value, country, onValidChange]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const found = countries.find((c) => c.code === code)!;
    setCountry(found);
    onChange(new AsYouType(code as any).input(value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^\d+]/g, "");
    const formatted = new AsYouType(country.code as any).input(digits);
    onChange(formatted);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/[^\d+]/g, "");
    const formatted = new AsYouType(country.code as any).input(text);
    onChange(formatted);
    e.preventDefault();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        Phone Number
      </Label>
      <div className="flex gap-2">
        <select
          aria-label="Country"
          className="rounded-lg border px-2 text-base bg-background"
          value={country.code}
          onChange={handleCountryChange}
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {flagEmoji(c.code)} +{getCountryCallingCode(c.code as any)} {c.name}
            </option>
          ))}
        </select>
        <Input
          id={id}
          type="tel"
          pattern="\+?[0-9\s-]{4,}"
          value={value}
          onChange={handleInputChange}
          onPaste={handlePaste}
          className="h-12 text-base flex-1"
          autoComplete="tel"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
