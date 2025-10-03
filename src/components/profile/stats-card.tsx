import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  color?: 'blue' | 'purple' | 'green' | 'amber' | 'red'
  trend?: string
}

const colorVariants = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  green: 'from-green-500 to-green-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600'
}

export function StatsCard({ 
  icon: Icon, 
  label, 
  value, 
  color = 'blue',
  trend 
}: StatsCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 bg-gradient-to-br ${colorVariants[color]} rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className="text-xs text-green-400 font-medium">
            {trend}
          </span>
        )}
      </div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
