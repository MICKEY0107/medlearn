'use client'

import { ReactNode, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from './Navbar'
import { LeftSidebar } from './LeftSidebar'
import { RightSidebar } from './RightSidebar'
import { BottomNav } from './BottomNav'

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max)

const LEFT_DEFAULT  = 230
const RIGHT_DEFAULT = 270
const LEFT_MIN  = 180
const LEFT_MAX  = 340
const RIGHT_MIN = 200
const RIGHT_MAX = 400

export function PageWrapper({ children }: { children: ReactNode }) {
  const [leftW,  setLeftW]  = useState(LEFT_DEFAULT)
  const [rightW, setRightW] = useState(RIGHT_DEFAULT)

  // which handle is being dragged: 'left' | 'right' | null
  const dragging = useRef<'left' | 'right' | null>(null)
  const startX   = useRef(0)
  const startW   = useRef(0)

  const onLeftMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = 'left'
    startX.current   = e.clientX
    startW.current   = leftW
    document.body.style.cursor     = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const onRightMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = 'right'
    startX.current   = e.clientX
    startW.current   = rightW
    document.body.style.cursor     = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      if (dragging.current === 'left') {
        const delta = e.clientX - startX.current
        setLeftW(clamp(startW.current + delta, LEFT_MIN, LEFT_MAX))
      } else {
        // dragging right handle: moving left = wider right sidebar
        const delta = startX.current - e.clientX
        setRightW(clamp(startW.current + delta, RIGHT_MIN, RIGHT_MAX))
      }
    }
    const onUp = () => {
      if (!dragging.current) return
      dragging.current = null
      document.body.style.cursor     = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Navbar */}
      <div className="flex-none z-50">
        <Navbar />
      </div>

      {/* Three-column body — overflow-hidden only on the row, not the columns */}
      <div className="flex-1 min-h-0 flex flex-row">

        {/* ── Left sidebar ── */}
        <div
          className="hidden md:flex flex-col flex-none h-full overflow-y-auto scrollbar-hide pt-5 pl-3 pb-5"
          style={{ width: leftW }}
        >
          <LeftSidebar />
        </div>

        {/* ── Left drag handle ── */}
        <div
          className="hidden md:flex flex-none items-center justify-center w-3 h-full cursor-col-resize group z-10"
          onMouseDown={onLeftMouseDown}
        >
          <div className="w-[3px] h-10 rounded-full bg-border group-hover:bg-brand/50 transition-colors duration-150" />
        </div>

        {/* ── Main feed — flex-1 so it takes all remaining space ── */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto scrollbar-hide pt-5 px-3 pb-24 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Right drag handle ── */}
        <div
          className="hidden lg:flex flex-none items-center justify-center w-3 h-full cursor-col-resize group z-10"
          onMouseDown={onRightMouseDown}
        >
          <div className="w-[3px] h-10 rounded-full bg-border group-hover:bg-brand/50 transition-colors duration-150" />
        </div>

        {/* ── Right sidebar ── */}
        <div
          className="hidden lg:flex flex-col flex-none h-full overflow-y-auto scrollbar-hide pt-5 pr-3 pb-5"
          style={{ width: rightW }}
        >
          <RightSidebar />
        </div>

      </div>

      {/* Mobile bottom nav */}
      <div className="flex-none z-50 md:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
