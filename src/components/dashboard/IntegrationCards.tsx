import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Bot, 
  UtensilsCrossed,
  Settings,
  ExternalLink,
  Activity,
  AlertCircle,
  CheckCircle
} from "lucide-react";

interface IntegrationCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  status: "connected" | "disconnected" | "error";
  color: "whatsapp" | "ifood" | "ai";
  metrics?: {
    label: string;
    value: string;
  }[];
  onConfigure: () => void;
  onViewDetails: () => void;
}

function IntegrationCard({ 
  title, 
  description, 
  icon: Icon, 
  status, 
  color,
  metrics = [],
  onConfigure,
  onViewDetails
}: IntegrationCardProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Activity className="w-3 h-3 mr-1" />
            Desconectado
          </Badge>
        );
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case "whatsapp":
        return "border-whatsapp/20 hover:border-whatsapp/40 bg-gradient-to-br from-whatsapp/5 to-transparent";
      case "ifood":
        return "border-ifood/20 hover:border-ifood/40 bg-gradient-to-br from-ifood/5 to-transparent";
      case "ai":
        return "border-ai/20 hover:border-ai/40 bg-gradient-to-br from-ai/5 to-transparent";
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
    }
  };

  return (
    <Card className={`${getColorClasses()} transition-all duration-300 hover:shadow-lg group animate-scale-in`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${color}/10 ${getIconColor()}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm mt-1">{description}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-semibold">{metric.value}</div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onConfigure}
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewDetails}
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntegrationCards() {
  const integrations = [
    {
      title: "WhatsApp Business",
      description: "API oficial do WhatsApp para empresas",
      icon: MessageSquare,
      status: "connected" as const,
      color: "whatsapp" as const,
      metrics: [
        { label: "Mensagens hoje", value: "127" },
        { label: "Taxa entrega", value: "98.5%" },
      ],
    },
    {
      title: "OpenAI GPT",
      description: "Inteligência artificial avançada",
      icon: Bot,
      status: "connected" as const,
      color: "ai" as const,
      metrics: [
        { label: "Tokens usados", value: "45.2K" },
        { label: "Requests/dia", value: "234" },
      ],
    },
    {
      title: "iFood",
      description: "Gestão de pedidos e cardápio",
      icon: UtensilsCrossed,
      status: "error" as const,
      color: "ifood" as const,
      metrics: [
        { label: "Pedidos hoje", value: "23" },
        { label: "Status", value: "Offline" },
      ],
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
      {integrations.map((integration, index) => (
        <div key={integration.title} className="animate-slide-up" style={{ animationDelay: `${index * 150}ms` }}>
          <IntegrationCard
            {...integration}
            onConfigure={() => console.log(`Configure ${integration.title}`)}
            onViewDetails={() => console.log(`View details ${integration.title}`)}
          />
        </div>
      ))}
    </div>
  );
}