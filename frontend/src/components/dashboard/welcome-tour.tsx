"use client";

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TourStep {
    id: string
    targetId: string
    title: string
    description: string
    position: "right" | "left" | "top" | "bottom"
    url?: string
}

const TOUR_STEPS: TourStep[] = [
    {
        id: "new-order",
        targetId: "tour-sidebar-new-order",
        title: "New Order",
        description: "Start growing your social presence by placing your first order here. Choose from hundreds of high-quality services.",
        position: "right",
        url: "/"
    },
    {
        id: "select-category",
        targetId: "tour-new-order-category",
        title: "Category",
        description: "Choose the social media platform or specific category you want to grow. ⭐ Means it's one of our top-tier services.",
        position: "top",
        url: "/"
    },
    {
        id: "select-service",
        targetId: "tour-new-order-service",
        title: "Services",
        description: "Pick the specific service package that fits your needs. Each service has different features and speeds.",
        position: "top",
        url: "/"
    },
    {
        id: "add-funds",
        targetId: "tour-sidebar-add-funds",
        title: "Add Funds",
        description: "Add balance to your account to start placing orders. We support various payment methods including Local gateways support.",
        position: "right",
        url: "/add-funds"
    },
    {
        id: "orders-history",
        targetId: "tour-sidebar-orders-history",
        title: "Orders History",
        description: "Keep track of all your orders, their progress, and status in real-time.",
        position: "right",
        url: "/orders"
    },
]

export function WelcomeTour() {
    const router = useRouter()
    const [currentStepIndex, setCurrentStepIndex] = useState(-1)
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isMobile, setIsMobile] = useState(false)

    const updateTargetRect = useCallback((index?: number) => {
        if (typeof window === "undefined") return
        const mobile = window.innerWidth < 1024
        setIsMobile(mobile)

        const stepIdx = index !== undefined ? index : currentStepIndex
        if (stepIdx >= 0 && stepIdx < TOUR_STEPS.length) {
            const step = TOUR_STEPS[stepIdx]
            let element = document.getElementById(step.targetId)

            const isSidebarStep = step.targetId.startsWith("tour-sidebar-")

            if (mobile && isSidebarStep && (!element || element.offsetParent === null)) {
                element = document.getElementById("tour-mobile-menu-trigger")
            }

            if (element) {
                const rect = element.getBoundingClientRect()
                // Only update if changes to prevent unnecessary re-renders
                setTargetRect(prev => {
                    if (!prev ||
                        prev.top !== rect.top ||
                        prev.left !== rect.left ||
                        prev.width !== rect.width ||
                        prev.height !== rect.height) {
                        return rect
                    }
                    return prev
                })
                return true
            } else {
                setTargetRect(null)
                return false
            }
        }
        return false
    }, [currentStepIndex])

    useEffect(() => {
        const isCompleted = localStorage.getItem("nepo_tour_completed")
        if (isCompleted === "true") {
            setIsVisible(false)
            return
        }

        // Only show for newly registered accounts (last 1 hour)
        const savedUser = localStorage.getItem("nepo_user")
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser)
                if (user.created_at) {
                    const createdAt = new Date(user.created_at).getTime()
                    const now = Date.now()
                    const oneHour = 60 * 60 * 1000

                    if (now - createdAt > oneHour) {
                        setIsVisible(false)
                        return
                    }
                }
            } catch (e) { }
        }

        const savedStep = sessionStorage.getItem("nepo_tour_step")
        const initialStep = savedStep ? parseInt(savedStep) : 0
        setCurrentStepIndex(initialStep)
        setIsVisible(true)
    }, [])

    useEffect(() => {
        if (currentStepIndex >= 0) {
            sessionStorage.setItem("nepo_tour_step", currentStepIndex.toString())

            // Robust polling for the target element
            let attempts = 0
            const maxAttempts = 25

            const poll = () => {
                const step = TOUR_STEPS[currentStepIndex]
                if (!step) return

                const element = document.getElementById(step.targetId)
                if (element) {
                    // Found it! Scroll into view
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    })

                    // Update positions repeatedly as scroll/layout settles
                    updateTargetRect(currentStepIndex)
                    setTimeout(() => updateTargetRect(currentStepIndex), 100)
                    setTimeout(() => updateTargetRect(currentStepIndex), 300)
                    setTimeout(() => updateTargetRect(currentStepIndex), 600)
                } else if (attempts < maxAttempts) {
                    attempts++
                    setTimeout(poll, 200)
                }
            }

            const initialDelay = TOUR_STEPS[currentStepIndex]?.url !== window.location.pathname ? 600 : 50
            const timer = setTimeout(poll, initialDelay)
            return () => clearTimeout(timer)
        }
    }, [currentStepIndex, updateTargetRect])

    useEffect(() => {
        if (currentStepIndex >= 0 && currentStepIndex < TOUR_STEPS.length) {
            const step = TOUR_STEPS[currentStepIndex]
            const isSidebarStep = step.targetId.startsWith("tour-sidebar-")

            if (isMobile && isSidebarStep) {
                window.dispatchEvent(new CustomEvent("openSidebar"))
            } else if (isMobile && !isSidebarStep) {
                window.dispatchEvent(new CustomEvent("closeSidebar"))
            }
        }
    }, [currentStepIndex, isMobile])

    useEffect(() => {
        if (isVisible && currentStepIndex !== -1) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isVisible, currentStepIndex])

    useEffect(() => {
        window.addEventListener("resize", () => updateTargetRect())
        window.addEventListener("scroll", () => updateTargetRect())
        return () => {
            window.removeEventListener("resize", () => updateTargetRect())
            window.removeEventListener("scroll", () => updateTargetRect())
        }
    }, [updateTargetRect])

    const handleNext = () => {
        if (currentStepIndex < TOUR_STEPS.length - 1) {
            const currentStep = TOUR_STEPS[currentStepIndex]
            const nextIndex = currentStepIndex + 1
            const nextStep = TOUR_STEPS[nextIndex]

            // Check if we need to navigate
            const currentPath = window.location.pathname
            const targetPath = nextStep.url

            if (targetPath && currentPath !== targetPath) {
                router.push(targetPath)
            }

            // Mobile sidebar management
            const isLeavingSidebar = currentStep.targetId.startsWith("tour-sidebar-") &&
                !nextStep.targetId.startsWith("tour-sidebar-")

            if (isLeavingSidebar && isMobile) {
                window.dispatchEvent(new CustomEvent("closeSidebar"))
            }

            setCurrentStepIndex(nextIndex)
        } else {
            handleComplete()
        }
    }

    const handleSkip = () => {
        handleComplete()
    }

    const handleComplete = () => {
        setIsVisible(false)
        sessionStorage.removeItem("nepo_tour_step")
        localStorage.setItem("nepo_tour_completed", "true")
        router.push("/")
    }

    if (!isVisible || currentStepIndex === -1) return null

    const step = TOUR_STEPS[currentStepIndex]

    // Safety check: ensure step exists
    if (!step) return null

    // Determine if element is in viewport
    const isElementInViewport = targetRect &&
        targetRect.top >= 0 &&
        targetRect.left >= 0 &&
        targetRect.bottom <= (typeof window !== 'undefined' ? window.innerHeight : 0) &&
        targetRect.right <= (typeof window !== 'undefined' ? window.innerWidth : 0);

    const isSidebarStep = step.targetId.startsWith("tour-sidebar-");
    const useCenteredLayout = false; // Always attempt to show spotlight hole if element is visible

    // Tooltip Styles
    let tooltipStyle: React.CSSProperties = {}
    let arrowClass = ""
    let initialX = 0
    let initialY = 10

    const adaptiveMobilePos = isMobile && targetRect ? (targetRect.top > (typeof window !== 'undefined' ? window.innerHeight / 2 : 400) ? 'top' : 'bottom') : 'bottom';

    if (isMobile) {
        // Mobile: Adaptive floating style
        if (adaptiveMobilePos === 'top') {
            tooltipStyle = {
                top: "80px",
                left: "16px",
                right: "16px",
                margin: "0 auto",
                maxWidth: "340px"
            }
            initialY = -20
        } else {
            tooltipStyle = {
                bottom: "100px",
                left: "16px",
                right: "16px",
                margin: "0 auto",
                maxWidth: "340px"
            }
            initialY = 20
        }
        arrowClass = "hidden"
    } else if (targetRect) {
        // Desktop / Pointing Style
        const gap = 20
        if (step.position === "right") {
            tooltipStyle = {
                top: targetRect.top + targetRect.height / 2 - 125, // Shifted further upward
                left: targetRect.right + gap,
                transform: "translateY(-50%)",
                maxWidth: "320px"
            }
            arrowClass = "left-[-6px] top-1/2 -translate-y-1/2 border-l border-b"
            initialX = -20
            initialY = 0
        } else if (step.position === "top") {
            const topOffset = 280
            tooltipStyle = {
                top: targetRect.top - topOffset,
                left: targetRect.left + targetRect.width / 2,
                transform: "translate(-50%, -100%)",
                maxWidth: "320px"
            }
            arrowClass = "bottom-[-6px] left-1/2 -translate-x-1/2 border-r border-b"
            initialX = 0
            initialY = 20
        } else {
            // Default to right
            tooltipStyle = {
                top: targetRect.top + targetRect.height / 2 - 60, // Shifted further upward
                left: targetRect.right + gap,
                transform: "translateY(-50%)",
                maxWidth: "320px"
            }
            arrowClass = "left-[-6px] top-1/2 -translate-y-1/2 border-l border-b"
            initialX = -20
            initialY = 0
        }
    }

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/40 backdrop-blur-sm pointer-events-auto transition-all duration-300"
                onClick={handleSkip}
                style={{
                    clipPath: (targetRect && isElementInViewport) ? `polygon(
                        0% 0%, 0% 100%, 
                        ${targetRect.left - 4}px 100%, 
                        ${targetRect.left - 4}px ${targetRect.top - 4}px, 
                        ${targetRect.right + 4}px ${targetRect.top - 4}px, 
                        ${targetRect.right + 4}px ${targetRect.bottom + 4}px, 
                        ${targetRect.left - 4}px ${targetRect.bottom + 4}px, 
                        ${targetRect.left - 4}px 100%, 
                        100% 100%, 100% 0%
                    )` : 'none'
                }}
            />

            {/* Curved Arrow (Dynamic SVG - Mobile Only) */}
            <AnimatePresence>
                {isMobile && targetRect && isElementInViewport && (
                    <motion.svg
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 w-full h-full pointer-events-none z-[10002] overflow-visible"
                    >
                        <defs>
                            <filter id="arrow-glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="glow" />
                                <feComposite in="SourceGraphic" in2="glow" operator="over" />
                            </filter>
                        </defs>
                        <motion.path
                            d={(() => {
                                const startX = window.innerWidth / 2
                                // Adjust startY based on whether tooltip is at top or bottom
                                const startY = adaptiveMobilePos === 'top' ? 280 : window.innerHeight - 380

                                const endX = targetRect.left + targetRect.width / 2
                                const isTargetAbove = targetRect.top < startY
                                const endY = isTargetAbove ? targetRect.bottom + 10 : targetRect.top - 10
                                const dy = endY - startY
                                return `M ${startX} ${startY} C ${startX} ${startY + dy * 0.5}, ${endX} ${startY + dy * 0.5}, ${endX} ${endY}`
                            })()}
                            stroke="rgb(59, 130, 246)"
                            strokeWidth="3"
                            strokeDasharray="8,5"
                            fill="none"
                            style={{ filter: "url(#arrow-glow)" }}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.8 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                        />
                        <motion.circle
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.3 }}
                            cx={window.innerWidth / 2}
                            cy={adaptiveMobilePos === 'top' ? 280 : window.innerHeight - 380}
                            r="4"
                            fill="rgb(59, 130, 246)"
                        />
                        {/* Styled Arrowhead */}
                        <motion.path
                            variants={{
                                hidden: { opacity: 0, scale: 0 },
                                visible: { opacity: 1, scale: 1 }
                            }}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.8, duration: 0.4 }}
                            d={(() => {
                                const endX = targetRect.left + targetRect.width / 2
                                const startY = adaptiveMobilePos === 'top' ? 280 : window.innerHeight - 380
                                const isTargetAbove = targetRect.top < startY
                                const endY = isTargetAbove ? targetRect.bottom + 10 : targetRect.top - 10
                                if (isTargetAbove) {
                                    return `M ${endX - 9} ${endY + 14} L ${endX} ${endY} L ${endX + 9} ${endY + 14} Z`
                                } else {
                                    return `M ${endX - 9} ${endY - 14} L ${endX} ${endY} L ${endX + 9} ${endY - 14} Z`
                                }
                            })()}
                            fill="rgb(59, 130, 246)"
                        />
                    </motion.svg>
                )}
            </AnimatePresence>

            {/* Highlight */}
            {targetRect && isElementInViewport && (
                <motion.div
                    initial={false}
                    animate={{
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                    }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute border-2 border-primary rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.6)] z-[10000]"
                />
            )}

            {/* Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: initialX, y: initialY, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 20, stiffness: 150 }}
                    className="fixed z-[10001] pointer-events-auto"
                    style={{ ...tooltipStyle }}
                >
                    {/* Arrow */}
                    <div className={cn("absolute w-3 h-3 bg-[#111111] border-white/10 rotate-45", arrowClass)} />

                    <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
                        <button
                            onClick={handleSkip}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="size-4" />
                        </button>

                        <div className="mb-4">
                            <span className="bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                                STEP {currentStepIndex + 1} OF {TOUR_STEPS.length}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                            {step.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleSkip}
                                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 font-medium transition-colors"
                            >
                                Skip Tour
                            </button>
                            <Button
                                onClick={handleNext}
                                className="bg-primary hover:bg-primary/90 text-white font-bold px-6 rounded-xl"
                            >
                                {currentStepIndex === TOUR_STEPS.length - 1 ? "Get Started" : "Got it"}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}