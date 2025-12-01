'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
    children: React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

/**
 * Global error boundary to catch and display errors gracefully
 */
export class ErrorBoundary extends React.Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to error reporting service in production
        if (process.env.NODE_ENV === 'production') {
            // TODO: Send to error tracking service (e.g., Sentry)
            console.error('Error Boundary caught:', error, errorInfo)
        } else {
            console.error('Error Boundary caught:', error, errorInfo)
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="text-destructive flex items-center gap-2">
                                <AlertTriangle className="h-6 w-6" />
                                <CardTitle>Terjadi Kesalahan</CardTitle>
                            </div>
                            <CardDescription>
                                Maaf, terjadi kesalahan yang tidak terduga. Tim
                                kami telah diberitahu dan sedang menanganinya.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {process.env.NODE_ENV === 'development' &&
                                this.state.error && (
                                    <div className="bg-muted overflow-auto rounded-md p-4">
                                        <p className="text-muted-foreground font-mono text-sm">
                                            {this.state.error.toString()}
                                        </p>
                                    </div>
                                )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                onClick={this.handleReset}
                                className="w-full"
                            >
                                Kembali ke Beranda
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}
