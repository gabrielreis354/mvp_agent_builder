declare module 'lucide-react' {
  import * as React from 'react'

  export interface LucideProps extends Partial<Omit<React.SVGProps<SVGSVGElement>, 'ref'>> {
    size?: string | number
    absoluteStrokeWidth?: boolean
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >

  // Exportar todos os ícones usados no projeto
  export const Activity: LucideIcon
  export const AlertCircle: LucideIcon
  export const AlertTriangle: LucideIcon
  export const ArrowLeft: LucideIcon
  export const ArrowRight: LucideIcon
  export const ArrowUp: LucideIcon
  export const BarChart3: LucideIcon
  export const Bell: LucideIcon
  export const Bolt: LucideIcon
  export const Brain: LucideIcon
  export const Briefcase: LucideIcon
  export const Building: LucideIcon
  export const Building2: LucideIcon
  export const Calculator: LucideIcon
  export const Calendar: LucideIcon
  export const Check: LucideIcon
  export const CheckCircle: LucideIcon
  export const CheckCircle2: LucideIcon
  export const ChevronDown: LucideIcon
  export const ChevronLeft: LucideIcon
  export const ChevronRight: LucideIcon
  export const ChevronUp: LucideIcon
  export const Circle: LucideIcon
  export const Clock: LucideIcon
  export const Code: LucideIcon
  export const Copy: LucideIcon
  export const Cpu: LucideIcon
  export const Crown: LucideIcon
  export const Database: LucideIcon
  export const DollarSign: LucideIcon
  export const Download: LucideIcon
  export const Edit: LucideIcon
  export const ExternalLink: LucideIcon
  export const Eye: LucideIcon
  export const EyeOff: LucideIcon
  export const FileSpreadsheet: LucideIcon
  export const FileText: LucideIcon
  export const FileCheck: LucideIcon
  export const FileOutput: LucideIcon
  export const Filter: LucideIcon
  export const GitBranch: LucideIcon
  export const Globe: LucideIcon
  export const Grid: LucideIcon
  export const Heart: LucideIcon
  export const Home: LucideIcon
  export const Info: LucideIcon
  export const Lightbulb: LucideIcon
  export const Linkedin: LucideIcon
  export const Lock: LucideIcon
  export const List: LucideIcon
  export const Loader: LucideIcon
  export const Loader2: LucideIcon
  export const LogOut: LucideIcon
  export const Mail: LucideIcon
  export const MessageSquare: LucideIcon
  export const MoreVertical: LucideIcon
  export const Palette: LucideIcon
  export const Pause: LucideIcon
  export const Play: LucideIcon
  export const Plus: LucideIcon
  export const RefreshCw: LucideIcon
  export const RotateCw: LucideIcon
  export const Save: LucideIcon
  export const Scale: LucideIcon
  export const Search: LucideIcon
  export const Send: LucideIcon
  export const Settings: LucideIcon
  export const Shield: LucideIcon
  export const Sliders: LucideIcon
  export const Sparkles: LucideIcon
  export const Square: LucideIcon
  export const Star: LucideIcon
  export const StopCircle: LucideIcon
  export const Target: LucideIcon
  export const Trash2: LucideIcon
  export const TrendingDown: LucideIcon
  export const TrendingUp: LucideIcon
  export const Upload: LucideIcon
  export const User: LucideIcon
  export const UserCheck: LucideIcon
  export const UserPlus: LucideIcon
  export const Users: LucideIcon
  export const Wand2: LucideIcon
  export const Workflow: LucideIcon
  export const X: LucideIcon
  export const XCircle: LucideIcon
  export const Zap: LucideIcon
}
