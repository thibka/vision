"use client"

import { Input } from "@/components/Input"
import { Label } from "@/components/Label"

export default function InputSearch({ children, placeholder }: { children?: React.ReactNode; placeholder: string }) {
  return (
    <div className="mx-auto max-w-xs space-y-2">
      {children && <Label htmlFor="search" className="mb-2">{ children }</Label>}
      <Input
        placeholder={placeholder}
        id="search"
        name="search"
        type="search"
      />
    </div>
  )
}