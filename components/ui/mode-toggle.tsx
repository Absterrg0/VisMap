"use client"

import { useTheme } from "next-themes"
import { Button } from "@nextui-org/react"
import { Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      isIconOnly
      variant="light"
      onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed top-4 right-4"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
} 