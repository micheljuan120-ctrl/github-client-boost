import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { IntegrationCards } from "@/components/dashboard/IntegrationCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Plus, 
  TrendingUp,
  Clock,
  Users,
  Zap
} from "lucide-react";

function RecentActivities() {
  const activities = [
    {
      type: "whatsapp",
      message: "Nova mensagem recebida no WhatsApp",
      time: "2 min atrás",
      user: "Cliente XYZ",
    },
    {
      type: "ai",
      message: "Processamento AI concluído",
      time: "5 min atrás",
      user: "Sistema",
    },
    {
      type: "ifood",
      message: "Novo pedido recebido",
      time: "12 min atrás",
      user: "iFood",
    },
    {
      type: "automation",
      message: "Automação executada com sucesso",
      time: "15 min atrás",
      user: "Sistema",
    },
  ];

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Atividades Recentes
        </CardTitle>
        <CardDescription>
          Últimas ações em suas integrações
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">{activity.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{activity.user}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  const actions = [
    {
      title: "Nova Automação",
      description: "Criar fluxo automatizado",
      icon: Zap,
      color: "primary",
    },
    {
      title: "Configurar API",
      description: "Adicionar nova integração",
      icon: Plus,
      color: "accent",
    },
    {
      title: "Ver Analytics",
      description: "Relatórios detalhados",
      icon: TrendingUp,
      color: "secondary",
    },
  ];

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
        <CardDescription>
          Acesso direto às principais funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="justify-start h-auto p-4 text-left"
            >
              <action.icon className="w-5 h-5 mr-3 text-primary" />
              <div>
                <div className="font-medium">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SystemStatus() {
  const services = [
    { name: "WhatsApp API", status: "online", uptime: "99.9%" },
    { name: "OpenAI GPT", status: "online", uptime: "99.5%" },
    { name: "iFood API", status: "maintenance", uptime: "95.2%" },
    { name: "Automations", status: "online", uptime: "99.8%" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Online</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Manutenção</Badge>;
      default:
        return <Badge variant="destructive">Offline</Badge>;
    }
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Status do Sistema
        </CardTitle>
        <CardDescription>
          Monitoramento em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
              <div>
                <p className="text-sm font-medium">{service.name}</p>
                <p className="text-xs text-muted-foreground">Uptime: {service.uptime}</p>
              </div>
              {getStatusBadge(service.status)}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo de volta! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Aqui está um resumo das suas integrações e atividades
          </p>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Integration Cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Suas Integrações
          </h2>
          <IntegrationCards />
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <RecentActivities />
          <QuickActions />
          <SystemStatus />
        </div>
      </div>
    </DashboardLayout>
  );
}