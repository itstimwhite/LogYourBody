import React from "react";
import PhoneInput from "react-phone-number-input";
import en from "react-phone-number-input/locale/en.json";
import { cn } from "@/lib/utils";

export interface PhoneNumberInputProps {
  value?: string;
  onChange: (value?: string) => void;
  defaultCountry?: string;
  className?: string;
  countrySelectClassName?: string;
  inputClassName?: string;
}

export const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(
  (
    {
      value,
      onChange,
      defaultCountry = "US",
      className,
      countrySelectClassName,
      inputClassName,
      ...rest
    },
    ref,
  ) => {
    return (
      <PhoneInput
        {...rest}
        ref={ref}
        international
        defaultCountry={defaultCountry}
        value={value}
        onChange={onChange}
        labels={en}
        className={cn(
          "flex h-12 w-full items-center rounded-lg border border-linear-border bg-linear-card focus-within:border-linear-purple",
          className,
        )}
        countrySelectProps={{
          className: cn(
            "mr-2 rounded-l-lg bg-transparent pl-3 pr-1 py-2 text-sm outline-none",
            countrySelectClassName,
          ),
        }}
        numberInputProps={{
          className: cn(
            "PhoneInputInput flex-1 rounded-r-lg bg-transparent px-2 py-2 text-base text-linear-text placeholder:text-linear-text-tertiary focus:outline-none",
            inputClassName,
          ),
          autoComplete: "tel",
        }}
      />
    );
  },
);
PhoneNumberInput.displayName = "PhoneNumberInput";
