import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  MessageSquare, 
  Bot, 
  UtensilsCrossed,
  Zap,
  BarChart3,
  Shield,
  Globe,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "WhatsApp Business API",
      description: "Integração completa com WhatsApp Business para automação de mensagens e atendimento.",
      color: "whatsapp",
    },
    {
      icon: Bot,
      title: "APIs de Inteligência Artificial",
      description: "Conecte-se com OpenAI, Claude, Gemini e outras IAs para automatizar processos.",
      color: "ai",
    },
    {
      icon: UtensilsCrossed,
      title: "Integração iFood",
      description: "Gerencie pedidos, cardápio e notificações diretamente do painel.",
      color: "ifood",
    },
    {
      icon: Zap,
      title: "Automações Inteligentes",
      description: "Crie fluxos automatizados conectando diferentes APIs e serviços.",
      color: "default",
    },
    {
      icon: BarChart3,
      title: "Analytics Avançado",
      description: "Monitore performance, métricas e insights em tempo real.",
      color: "default",
    },
    {
      icon: Shield,
      title: "Segurança Enterprise",
      description: "Proteção de dados e compliance com padrões internacionais.",
      color: "default",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "R$ 97",
      period: "/mês",
      description: "Perfeito para pequenos negócios",
      features: [
        "1.000 mensagens WhatsApp",
        "5.000 tokens AI",
        "1 integração iFood",
        "5 automações",
        "Suporte por email",
      ],
      isPopular: false,
    },
    {
      name: "Professional",
      price: "R$ 297",
      period: "/mês",
      description: "Para empresas em crescimento",
      features: [
        "10.000 mensagens WhatsApp",
        "50.000 tokens AI",
        "3 integrações iFood",
        "Automações ilimitadas",
        "Suporte prioritário",
        "Analytics avançado",
      ],
      isPopular: true,
    },
    {
      name: "Enterprise",
      price: "R$ 597",
      period: "/mês",
      description: "Para grandes operações",
      features: [
        "Mensagens ilimitadas",
        "Tokens AI ilimitados",
        "Integrações ilimitadas",
        "White-label",
        "Suporte 24/7",
        "Gerente dedicado",
      ],
      isPopular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">OmniAI Link</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-primary transition-colors">Recursos</a>
            <a href="#pricing" className="text-sm hover:text-primary transition-colors">Preços</a>
            <a href="#contact" className="text-sm hover:text-primary transition-colors">Contato</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">Entrar</Button>
            <Button asChild size="sm">
              <Link to="/dashboard">
                Acessar Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-primary text-white">
            <Globe className="w-3 h-3 mr-1" />
            Plataforma de Integração Omnichannel
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Conecte tudo em um só lugar
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Integre WhatsApp Business, APIs de IA e iFood em uma plataforma unificada. 
            Automatize processos e escale seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg px-8">
              <Link to="/dashboard">
                Começar Agora <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Recursos Poderosos
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo que você precisa para automatizar e integrar seus processos de negócio
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-gradient-card hover:shadow-lg transition-all duration-300 animate-scale-in">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos para todos os tamanhos
            </h2>
            <p className="text-xl text-muted-foreground">
              Escolha o plano ideal para seu negócio
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative border-2 transition-all duration-300 hover:shadow-lg ${
                plan.isPopular 
                  ? "border-primary shadow-lg scale-105" 
                  : "border-border hover:border-primary/50"
              }`}>
                {plan.isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.isPopular ? "default" : "outline"}
                    size="lg"
                  >
                    Começar agora
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-16 bg-secondary/20">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-xl">OmniAI Link</span>
              </div>
              <p className="text-muted-foreground">
                A plataforma definitiva para integração e automação de negócios.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Documentação</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Comunidade</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Termos</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 OmniAI Link. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
