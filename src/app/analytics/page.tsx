'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Calendar,
  ArrowLeft 
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import HRDashboard from '@/components/analytics/HRDashboard'
import ExecutiveDashboard from '@/components/analytics/ExecutiveDashboard'

type DashboardMode = 'hr' | 'executive'

export default function AnalyticsPage() {
  const [mode, setMode] = useState<DashboardMode>('hr')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              
              <div className="h-6 w-px bg-gray-600" />
              
              <div className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-blue-400" />
                <h1 className="text-xl font-bold">Analytics & BI Dashboard</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Mode Toggle */}
              <div className="flex bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setMode('hr')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'hr' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  RH Dashboard
                </button>
                <button
                  onClick={() => setMode('executive')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    mode === 'executive' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Executivo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'hr' ? (
            <HRDashboard />
          ) : (
            <ExecutiveDashboard />
          )}
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-gray-400">
            <span>Dashboard: {mode === 'hr' ? 'Recursos Humanos' : 'Executivo'}</span>
            <span>•</span>
            <span>Última atualização: {new Date().toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-400 text-xs">Dados em tempo real</span>
          </div>
        </div>
      </div>
    </div>
  )
}
