import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  Bot, 
  UtensilsCrossed,
  Zap,
  DollarSign,
  Activity
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "default" | "whatsapp" | "ifood" | "ai";
}

function StatCard({ title, value, description, icon: Icon, trend, color = "default" }: StatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "whatsapp":
        return "border-whatsapp/20 bg-gradient-to-br from-whatsapp/5 to-transparent";
      case "ifood":
        return "border-ifood/20 bg-gradient-to-br from-ifood/5 to-transparent";
      case "ai":
        return "border-ai/20 bg-gradient-to-br from-ai/5 to-transparent";
      default:
        return "border-dashboard-border bg-gradient-card";
    }
  };

  const getIconColor = () => {
    switch (color) {
      case "whatsapp":
        return "text-whatsapp";
      case "ifood":
        return "text-ifood";
      case "ai":
        return "text-ai";
      default:
        return "text-primary";
    }
  };

  return (
    <Card className={`${getColorClasses()} transition-all duration-300 hover:shadow-lg animate-scale-in`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${getIconColor()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <Badge 
              variant={trend.isPositive ? "default" : "destructive"}
              className="text-xs"
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(trend.value)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const stats = [
    {
      title: "Mensagens WhatsApp",
      value: "2,847",
      description: "Últimos 30 dias",
      icon: MessageSquare,
      color: "whatsapp" as const,
      trend: { value: 12.5, isPositive: true },
    },
    {
      title: "Requisições AI",
      value: "1,203",
      description: "APIs utilizadas",
      icon: Bot,
      color: "ai" as const,
      trend: { value: 8.2, isPositive: true },
    },
    {
      title: "Pedidos iFood",
      value: "456",
      description: "Este mês",
      icon: UtensilsCrossed,
      color: "ifood" as const,
      trend: { value: 15.3, isPositive: true },
    },
    {
      title: "Automações Ativas",
      value: "23",
      description: "Funcionando",
      icon: Zap,
      trend: { value: 2.1, isPositive: true },
    },
    {
      title: "Receita Total",
      value: "R$ 12.480",
      description: "Este mês",
      icon: DollarSign,
      trend: { value: 18.7, isPositive: true },
    },
    {
      title: "Uptime Médio",
      value: "99.8%",
      description: "Últimos 30 dias",
      icon: Activity,
      trend: { value: 0.2, isPositive: true },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {stats.map((stat, index) => (
        <div key={stat.title} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <StatCard {...stat} />
        </div>
      ))}
    </div>
  );
}