'use client'

import { useEffect, useRef, useState } from 'react'

interface CounterAnimationProps {
    value: number
    duration?: number
    className?: string
}

/**
 * CounterAnimation Component
 * 
 * Animates a number counting up from 0 to the target value.
 * Used for loyalty points display with smooth animation.
 * 
 * @param value - Target number to count to
 * @param duration - Animation duration in milliseconds (default: 1000ms)
 * @param className - Additional CSS classes
 */
export function CounterAnimation({
    value,
    duration = 1000,
    className = ''
}: CounterAnimationProps) {
    const [count, setCount] = useState(0)
    const countRef = useRef(0)
    const startTimeRef = useRef<number | null>(null)

    useEffect(() => {
        // Reset animation when value changes
        startTimeRef.current = null
        countRef.current = 0
        setCount(0)

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp
            }

            const elapsed = timestamp - startTimeRef.current
            const progress = Math.min(elapsed / duration, 1)

            // Easing function (ease-out cubic)
            const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
            const easedProgress = easeOutCubic(progress)

            const currentCount = Math.floor(easedProgress * value)
            countRef.current = currentCount
            setCount(currentCount)

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                setCount(value) // Ensure final value is exact
            }
        }

        if (value > 0) {
            requestAnimationFrame(animate)
        }

        return () => {
            startTimeRef.current = null
        }
    }, [value, duration])

    return (
        <span className={className}>
            {count.toLocaleString('id-ID')}
        </span>
    )
}
