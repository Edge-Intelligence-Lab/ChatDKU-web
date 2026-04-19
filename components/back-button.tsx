"use client"

import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function BackButton() {
  const router = useRouter()
  const { t } = useLanguage()

  return (
    <Button variant="outline" onClick={() => router.back()}>
      <ArrowLeft />
      {t("back")}
    </Button>
  )
}
