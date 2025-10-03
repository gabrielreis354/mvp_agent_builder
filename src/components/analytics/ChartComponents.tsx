'use client'

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
  ScatterChart,
  RadialBarChart,
  RadialBar
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Color palette for charts
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F97316',
  info: '#06B6D4',
  success: '#22C55E',
  muted: '#6B7280'
}

const DEPARTMENT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#22C55E']

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Headcount Trend Chart
interface HeadcountTrendProps {
  data: Array<{
    month: string
    headcount: number
    newHires: number
    terminations: number
  }>
}

export const HeadcountTrendChart: React.FC<HeadcountTrendProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Headcount</CardTitle>
        <CardDescription>Crescimento mensal e movimentação de funcionários</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="headcount"
              fill={CHART_COLORS.primary}
              fillOpacity={0.3}
              stroke={CHART_COLORS.primary}
              name="Total Funcionários"
            />
            <Bar yAxisId="right" dataKey="newHires" fill={CHART_COLORS.success} name="Admissões" />
            <Bar yAxisId="right" dataKey="terminations" fill={CHART_COLORS.danger} name="Desligamentos" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Turnover Analysis Chart
interface TurnoverAnalysisProps {
  data: Array<{
    month: string
    turnoverRate: number
    voluntaryRate: number
    involuntaryRate: number
  }>
}

export const TurnoverAnalysisChart: React.FC<TurnoverAnalysisProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Rotatividade</CardTitle>
        <CardDescription>Taxa de rotatividade voluntária vs involuntária</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number) => `${value.toFixed(1)}%`} />} 
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="turnoverRate"
              stroke={CHART_COLORS.primary}
              strokeWidth={3}
              name="Taxa Total"
            />
            <Line
              type="monotone"
              dataKey="voluntaryRate"
              stroke={CHART_COLORS.warning}
              strokeWidth={2}
              name="Voluntária"
            />
            <Line
              type="monotone"
              dataKey="involuntaryRate"
              stroke={CHART_COLORS.danger}
              strokeWidth={2}
              name="Involuntária"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Department Distribution Chart
interface DepartmentDistributionProps {
  data: Array<{
    name: string
    employees: number
    budget: number
    utilization: number
  }>
}

export const DepartmentDistributionChart: React.FC<DepartmentDistributionProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por Departamento</CardTitle>
        <CardDescription>Funcionários e orçamento por área</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pie Chart - Employees */}
          <div>
            <h4 className="text-sm font-medium mb-2">Funcionários por Departamento</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }: any) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="employees"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DEPARTMENT_COLORS[index % DEPARTMENT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart - Budget Utilization */}
          <div>
            <h4 className="text-sm font-medium mb-2">Utilização do Orçamento</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={60} />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="utilization" fill={CHART_COLORS.secondary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Performance Distribution Chart
interface PerformanceDistributionProps {
  data: Array<{
    rating: string
    count: number
    percentage: number
  }>
}

export const PerformanceDistributionChart: React.FC<PerformanceDistributionProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Performance</CardTitle>
        <CardDescription>Avaliações de desempenho por categoria</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
            <YAxis />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number) => `${value} funcionários`} />}
            />
            <Bar dataKey="count" fill={CHART_COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.map((item, index) => (
            <Badge key={index} variant="outline">
              {item.rating}: {item.percentage.toFixed(1)}%
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Compliance Status Chart
interface ComplianceStatusProps {
  data: Array<{
    eventType: string
    successRate: number
    totalEvents: number
    status: 'compliant' | 'warning' | 'critical'
  }>
}

export const ComplianceStatusChart: React.FC<ComplianceStatusProps> = ({ data }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return CHART_COLORS.success
      case 'warning':
        return CHART_COLORS.warning
      case 'critical':
        return CHART_COLORS.danger
      default:
        return CHART_COLORS.muted
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status de Compliance eSocial</CardTitle>
        <CardDescription>Taxa de sucesso por tipo de evento</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="eventType" />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number) => `${value.toFixed(1)}%`} />}
            />
            <Bar dataKey="successRate" fill={CHART_COLORS.primary} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.eventType}</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={item.status === 'compliant' ? 'default' : 'destructive'}
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  {item.successRate.toFixed(1)}%
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {item.totalEvents} eventos
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Cost Analysis Chart
interface CostAnalysisProps {
  data: Array<{
    month: string
    totalCost: number
    costPerEmployee: number
    budgetUtilization: number
  }>
}

export const CostAnalysisChart: React.FC<CostAnalysisProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Custos</CardTitle>
        <CardDescription>Evolução dos custos de RH</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number, name: string) => {
                if (name === 'Custo Total' || name === 'Custo por Funcionário') {
                  return formatCurrency(value)
                }
                return `${value.toFixed(1)}%`
              }} />}
            />
            <Legend />
            <Bar 
              yAxisId="left" 
              dataKey="totalCost" 
              fill={CHART_COLORS.primary} 
              name="Custo Total"
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="costPerEmployee" 
              stroke={CHART_COLORS.secondary} 
              strokeWidth={2}
              name="Custo por Funcionário"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="budgetUtilization" 
              stroke={CHART_COLORS.warning} 
              strokeWidth={2}
              name="Utilização do Orçamento (%)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Absence Analysis Chart
interface AbsenceAnalysisProps {
  data: Array<{
    month: string
    absenceRate: number
    sickLeave: number
    vacation: number
    personalLeave: number
  }>
}

export const AbsenceAnalysisChart: React.FC<AbsenceAnalysisProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Absenteísmo</CardTitle>
        <CardDescription>Taxa de ausências por tipo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              content={<CustomTooltip formatter={(value: number) => `${value.toFixed(1)}%`} />}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="sickLeave"
              stackId="1"
              stroke={CHART_COLORS.danger}
              fill={CHART_COLORS.danger}
              name="Atestado Médico"
            />
            <Area
              type="monotone"
              dataKey="vacation"
              stackId="1"
              stroke={CHART_COLORS.success}
              fill={CHART_COLORS.success}
              name="Férias"
            />
            <Area
              type="monotone"
              dataKey="personalLeave"
              stackId="1"
              stroke={CHART_COLORS.warning}
              fill={CHART_COLORS.warning}
              name="Licença Pessoal"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// KPI Gauge Chart
interface KPIGaugeProps {
  title: string
  value: number
  target: number
  unit: string
  color?: string
}

export const KPIGaugeChart: React.FC<KPIGaugeProps> = ({ 
  title, 
  value, 
  target, 
  unit, 
  color = CHART_COLORS.primary 
}) => {
  const percentage = Math.min((value / target) * 100, 100)
  const data = [
    { name: 'Atual', value: percentage, fill: color },
    { name: 'Restante', value: 100 - percentage, fill: '#E5E7EB' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width={120} height={120}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="90%" 
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar dataKey="value" cornerRadius={10} fill={color} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute text-center">
            <div className="text-lg font-bold">{value}</div>
            <div className="text-xs text-muted-foreground">{unit}</div>
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-muted-foreground">
            Meta: {target} {unit}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// Trend Indicator Component
interface TrendIndicatorProps {
  value: number
  previousValue: number
  label: string
  format?: 'number' | 'percentage' | 'currency'
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ 
  value, 
  previousValue, 
  label, 
  format = 'number' 
}) => {
  const change = value - previousValue
  const percentageChange = previousValue !== 0 ? (change / previousValue) * 100 : 0
  const isPositive = change > 0
  const isNeutral = change === 0

  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val.toFixed(1)}%`
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(val)
      default:
        return val.toString()
    }
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">{formatValue(value)}</span>
        <Badge 
          variant={isNeutral ? 'secondary' : isPositive ? 'default' : 'destructive'}
          className="text-xs"
        >
          {isNeutral ? '0%' : `${isPositive ? '+' : ''}${percentageChange.toFixed(1)}%`}
        </Badge>
      </div>
    </div>
  )
}
