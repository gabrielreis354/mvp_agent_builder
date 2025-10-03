'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Shield, 
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
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
  ResponsiveContainer
} from 'recharts'

// Types for HR Analytics
interface MetricData {
  metric_name: string
  category: string
  value: number
  unit: string
  period: string
  start_date: string
  end_date: string
  metadata?: any
  calculated_at: string
}

interface DashboardSummary {
  total_employees: number
  new_hires_this_month: number
  turnover_rate: number
  average_performance: number
  compliance_score: number
  total_payroll_cost: number
  key_metrics: MetricData[]
  alerts: Array<{
    type: 'info' | 'warning' | 'error'
    title: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
}

interface TrendData {
  metric_name: string
  trend_data: MetricData[]
  percentage_change: number
  trend_direction: 'up' | 'down' | 'stable'
}

// Mock data for development
const mockDashboardData: DashboardSummary = {
  total_employees: 245,
  new_hires_this_month: 12,
  turnover_rate: 8.5,
  average_performance: 4.2,
  compliance_score: 98.5,
  total_payroll_cost: 1250000.00,
  key_metrics: [
    {
      metric_name: 'total_headcount',
      category: 'headcount',
      value: 245,
      unit: 'employees',
      period: 'monthly',
      start_date: '2025-08-01',
      end_date: '2025-08-26',
      calculated_at: '2025-08-26T08:00:00Z'
    }
  ],
  alerts: [
    {
      type: 'warning',
      title: 'Alta Rotatividade - TI',
      message: 'Departamento de TI com rotatividade de 15% no último trimestre',
      severity: 'medium'
    },
    {
      type: 'info',
      title: 'Meta de Contratação Atingida',
      message: '12 novas contratações este mês, superando a meta de 10',
      severity: 'low'
    }
  ]
}

const mockTrendData = [
  { month: 'Jan', headcount: 220, turnover: 6.2, performance: 4.1 },
  { month: 'Fev', headcount: 225, turnover: 7.1, performance: 4.0 },
  { month: 'Mar', headcount: 230, turnover: 5.8, performance: 4.2 },
  { month: 'Abr', headcount: 235, turnover: 8.9, performance: 4.1 },
  { month: 'Mai', headcount: 240, turnover: 9.2, performance: 4.3 },
  { month: 'Jun', headcount: 242, turnover: 7.5, performance: 4.2 },
  { month: 'Jul', headcount: 243, turnover: 8.1, performance: 4.4 },
  { month: 'Ago', headcount: 245, turnover: 8.5, performance: 4.2 }
]

const departmentData = [
  { name: 'TI', employees: 45, budget: 450000, utilization: 92 },
  { name: 'RH', employees: 12, budget: 120000, utilization: 85 },
  { name: 'Vendas', employees: 65, budget: 520000, utilization: 88 },
  { name: 'Marketing', employees: 25, budget: 200000, utilization: 90 },
  { name: 'Financeiro', employees: 18, budget: 180000, utilization: 95 },
  { name: 'Operações', employees: 80, budget: 640000, utilization: 87 }
]

const complianceData = [
  { name: 'eSocial Enviados', value: 98.5, color: '#10B981' },
  { name: 'Pendentes', value: 1.5, color: '#F59E0B' }
]

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function HRDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary>(mockDashboardData)
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Simulate API call
  useEffect(() => {
    // In real implementation, fetch data from API
    // fetchDashboardData(selectedPeriod)
  }, [selectedPeriod])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'info':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getAlertVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive'
      case 'warning':
        return 'default'
      case 'info':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard RH</h1>
          <p className="text-muted-foreground">
            Métricas e indicadores de recursos humanos em tempo real
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {dashboardData.alerts.length > 0 && (
        <div className="space-y-2">
          {dashboardData.alerts.map((alert, index) => (
            <Alert key={index} variant={getAlertVariant(alert.type)}>
              {getAlertIcon(alert.type)}
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Funcionários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.total_employees}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData.new_hires_this_month} novos este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Rotatividade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(dashboardData.turnover_rate)}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant={dashboardData.turnover_rate > 10 ? "destructive" : "secondary"}>
                {dashboardData.turnover_rate > 10 ? "Acima da meta" : "Dentro da meta"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.average_performance.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Escala de 1 a 5
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance eSocial</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(dashboardData.compliance_score)}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant={dashboardData.compliance_score >= 95 ? "default" : "destructive"}>
                {dashboardData.compliance_score >= 95 ? "Conforme" : "Atenção"}
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="costs">Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Trend Chart */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Tendências Mensais</CardTitle>
                <CardDescription>
                  Evolução dos principais indicadores nos últimos 8 meses
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="headcount" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Funcionários"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="turnover" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Rotatividade (%)"
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="performance" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Performance"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribuição por Departamento</CardTitle>
                <CardDescription>
                  Funcionários por área
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="employees"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Department Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes por Departamento</CardTitle>
              <CardDescription>
                Orçamento e utilização por área
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="employees" fill="#3B82F6" name="Funcionários" />
                  <Bar yAxisId="right" dataKey="utilization" fill="#10B981" name="Utilização (%)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="headcount" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento do Headcount</CardTitle>
                <CardDescription>Evolução mensal do número de funcionários</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="headcount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Novas Contratações</CardTitle>
                <CardDescription>Contratações por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Este mês</span>
                    <Badge variant="default">{dashboardData.new_hires_this_month} contratações</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Meta mensal</span>
                    <Badge variant="outline">10 contratações</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Performance</span>
                    <Badge variant="default">120% da meta</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status eSocial</CardTitle>
                <CardDescription>Conformidade com obrigações governamentais</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complianceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {complianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Compliance</CardTitle>
                <CardDescription>Métricas de conformidade</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Eventos S-2200 (Admissões)</span>
                    <Badge variant="default">100%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Eventos S-2299 (Desligamentos)</span>
                    <Badge variant="default">98%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Eventos S-2230 (Afastamentos)</span>
                    <Badge variant="default">95%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Prazo médio de envio</span>
                    <Badge variant="outline">2.3 dias</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Custos</CardTitle>
              <CardDescription>Distribuição e evolução dos custos de RH</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Folha de Pagamento Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData.total_payroll_cost)}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Custo por Funcionário</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(dashboardData.total_payroll_cost / dashboardData.total_employees)}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Variação Mensal</p>
                  <p className="text-2xl font-bold text-green-600">+2.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
