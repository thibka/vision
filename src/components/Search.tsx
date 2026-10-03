"use client"

import { Input } from "@/components/Input"
import { Label } from "@/components/Label"

export const InputSearchExample = () => (
  <div className="mx-auto max-w-xs space-y-2">
    <Label htmlFor="search">Search</Label>
    <Input
      placeholder="Search addresses"
      id="search"
      name="search"
      type="search"
      className="mt-2"
    />
  </div>
)