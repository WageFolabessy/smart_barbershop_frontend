'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from './button'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        // Return placeholder with same dimensions to prevent layout shift
        return <div className="size-9" />
    }

    const isDark = theme === 'dark'

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={
                isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'
            }
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            className="transition-transform hover:scale-105"
        >
            {isDark ? (
                <Sun className="h-5 w-5 transition-transform duration-300" />
            ) : (
                <Moon className="h-5 w-5 transition-transform duration-300" />
            )}
        </Button>
    )
}
