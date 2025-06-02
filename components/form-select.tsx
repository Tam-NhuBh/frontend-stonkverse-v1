"use client";

import { FC, JSX } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { AiOutlineWarning } from "react-icons/ai";

interface Props {
  id: string;
  label: string;
  register?: UseFormRegisterReturn<string>;
  errorMsg?: string;
  options: string[];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FormSelect: FC<Props> = ({
  id,
  label,
  register,
  errorMsg,
  options,
  value,
  onChange,
}): JSX.Element => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="form-input-label">
        {label}
      </label>
      <select
        id={id}
        {...register}
        value={value}   
        onChange={onChange} 
        className="w-full outline-none border dark:border-slate-700 bg-[#f5f5f5] dark:bg-slate-900 rounded-sm py-[13px] px-4 capitalize"
      >
        <option value="" disabled>Select {label}</option> 
        {options.map((opt, index) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {errorMsg && (
        <p className="text-xs text-red-700 mt-1 flex items-center gap-[2px]">
          <AiOutlineWarning />
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export default FormSelect;
