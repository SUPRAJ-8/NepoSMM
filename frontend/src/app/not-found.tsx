import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="relative">
                    <h1 className="text-[12rem] font-black text-white/5 leading-none select-none">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-primary/20 p-8 rounded-full blur-3xl" />
                        <h2 className="text-4xl font-black text-white relative z-10 tracking-tight">Page Not Found</h2>
                    </div>
                </div>

                <p className="text-gray-400 text-lg font-medium">
                    The page you're looking for doesn't exist or has been moved.
                    Let's get you back to growing your social media.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/">
                        <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-blue-600 text-white font-black shadow-lg shadow-primary/20">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                    <Link href="/services">
                        <Button variant="outline" className="h-12 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold">
                            View Services
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
