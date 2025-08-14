
"use client"

import * as React from "react"
import { createContext, useContext } from "react"
import { useTheme } from "@/hooks/useTheme"

interface ThemeContextType {
  theme: string
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeData = useTheme()
  
  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}
