"use client";

import { ChangeEvent, FC, JSX, useEffect, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { AiOutlineWarning } from "react-icons/ai";

interface Props {
  id: string;
  type?: string;
  label?: string;
  register?: UseFormRegisterReturn<string>;
  errorMsg?: string;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  value?: any;
  readOnly?: boolean;
  preventLinks?: boolean;
  maxLength?: number;
  customClasses?: string;

  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const FormInput: FC<Props> = ({
  type = "text",
  id,
  label,
  register,
  errorMsg,
  textarea,
  rows,
  placeholder,
  disabled,
  value,
  readOnly,
  preventLinks = false,
  maxLength,
  customClasses,
  onChange,
}): JSX.Element => {
  const Component = textarea ? "textarea" : "input";
  const [hasLink, setHasLink] = useState<boolean>(false);
  const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const text = e.target.value;

    if (preventLinks) {
      const containsLink = linkRegex.test(text);
      setHasLink(containsLink);

      if (containsLink) {
        e.preventDefault();
        return;
      }
    }
    if (maxLength && text.length > maxLength) {
      e.target.value = text.slice(0, maxLength);
    }
    register?.onChange(e);
    onChange?.(e);
  };
  return (
    <div className="mb-4">
      <div className="flex justify-between">
        <label htmlFor={id} className="form-input-label">
          {label}
        </label>
        {maxLength && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Max {maxLength} characters
          </span>
        )}
      </div>
      <Component
        id={id}
        type={!textarea ? type : undefined}
        {...register}
        className={`w-full outline-none border dark:border-slate-700 bg-[#f5f5f5] dark:bg-transparent rounded-sm py-[10px] px-4 
          ${disabled ? "opacity-50" : ""}         
          ${hasLink ? "border-red-500" : ""}`}
        rows={textarea ? rows : undefined}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        min={type === "number" ? "0" : undefined}
        readOnly={readOnly}
        // onChange={(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        //   register?.onChange(e);
        //   onChange?.(e);
        // }}

        onChange={handleInputChange}
        onKeyPress={(event) => {
          if (type === "number" && !/[0-9]/.test(event.key)) {
            event.preventDefault();
          }
        }}
        maxLength={maxLength}
      />
      {errorMsg && (
        <p className="text-xs text-red-700 mt-1 flex items-center gap-[2px]">
          <AiOutlineWarning />
          {errorMsg}
        </p>
      )}
      {hasLink && (
        <p className="text-xs text-red-700 mt-1 flex items-center gap-[2px]">
          <AiOutlineWarning />
          Links are not allowed in this field
        </p>
      )}
    </div>
  );
};

export default FormInput;
