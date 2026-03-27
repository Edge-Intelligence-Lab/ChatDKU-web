"use client"

import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { ArrowLeft } from "lucide-react"

export function BackButton() {
  const router = useRouter()

  return (
    <Button variant="outline" onClick={() => router.back()}>
      <ArrowLeft />
      Back
    </Button>
  )
}