import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider"; // Adicionar import do Slider
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash, Zap, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Integration {
  id: number;
  name: string;
  type: string;
  config?: { apiKey: string; model?: string; temperature?: number; prompt?: string }; // Atualizado para incluir prompt e tornar opcional
  createdAt: string;
  updatedAt: string;
}

const aiModels = {
  gemini: [
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash (8B)', description: 'Modelo rápido e eficiente para tarefas de larga escala.' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', description: 'Modelo otimizado para velocidade e custo-benefício.' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: 'Modelo de alto desempenho para tarefas complexas.' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Próxima geração do Flash, ainda mais rápida.' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite', description: 'Versão leve do Flash 2.0 para uso em dispositivos.' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Modelo avançado com foco em velocidade e capacidade.' },
    { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', description: 'Próxima geração do Pro, com capacidades aprimoradas.' },
  ],
  openai: [
    { id: 'gpt-4.1-nano', name: 'GPT-4.1 Nano', description: 'Versão ultra-compacta do GPT-4.1 para tarefas rápidas.' },
    { id: 'gpt-4.1-mini', name: 'GPT-4.1 Mini', description: 'Modelo pequeno e eficiente para uso geral.' },
    { id: 'gpt-4.1', name: 'GPT-4.1', description: 'Modelo padrão do GPT-4.1 com bom equilíbrio.' },
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Modelo multimodal otimizado para interações naturais.' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Versão compacta do GPT-4o para eficiência.' },
  ],
  deepseek: [
    { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', description: 'Modelo focado em raciocínio lógico e resolução de problemas.' },
    { id: 'deepseek-chat', name: 'DeepSeek Chat', description: 'Modelo otimizado para conversação e interação.' },
  ],
};

const IntegrationsPage: React.FC = () => {
  const { token } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentIntegration, setCurrentIntegration] = useState<Integration | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formType, setFormType] = useState<string>('gemini'); // Default to gemini
  const [formApiKey, setFormApiKey] = useState<string>('');
  const [formModel, setFormModel] = useState<string>('');
  const [formTemperature, setFormTemperature] = useState<number>(0.7); // Novo estado para temperatura
  const [formPrompt, setFormPrompt] = useState<string>(''); // Novo estado para prompt

  const fetchIntegrations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/integrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIntegrations(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchIntegrations();
    }
  }, [token, fetchIntegrations]);

  const handleAddEditIntegration = async () => {
    setError(null);
    const integrationData = {
      name: formName,
      type: formType,
      config: { apiKey: formApiKey, model: formModel, temperature: formTemperature, prompt: formPrompt },
    };

    try {
      const url = currentIntegration 
        ? `http://localhost:3001/api/integrations/${currentIntegration.id}` 
        : 'http://localhost:3001/api/integrations';
      const method = currentIntegration ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(integrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      setIsModalOpen(false);
      fetchIntegrations(); // Refresh list
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const handleDeleteIntegration = async (id: number) => {
    setError(null);
    if (!window.confirm('Tem certeza que deseja deletar esta integração?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/integrations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      fetchIntegrations(); // Refresh list
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  const openEditModal = (integration: Integration) => {
    setCurrentIntegration(integration);
    setFormName(integration.name);
    setFormType(integration.type);
    setFormApiKey(integration.config.apiKey || '');
    setFormModel(integration.config.model || '');
    setFormTemperature(integration.config?.temperature != null ? integration.config.temperature : 0.7); // Carrega a temperatura existente, garantindo que seja um número
    setFormPrompt(integration.config.prompt || ''); // Carrega o prompt existente
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentIntegration(null);
    setFormName('');
    setFormType('gemini');
    setFormApiKey('');
    setFormModel(aiModels.gemini[0].id); // Define o primeiro modelo Gemini como padrão
    setFormTemperature(0.7); // Define a temperatura padrão
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        <div className="flex justify-between items-center pb-6">
          <h1 className="text-3xl font-bold tracking-tight">Integrações de IA</h1>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddModal}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Nova Integração
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-6">
              <DialogHeader className="space-y-2">
                <DialogTitle>{currentIntegration ? 'Editar Integração' : 'Adicionar Integração'}</DialogTitle>
                <CardDescription>
                  {currentIntegration ? 'Edite os detalhes da sua integração de IA.' : 'Adicione uma nova integração de IA para conectar seus serviços.'}
                </CardDescription>
              </DialogHeader>
              <div className="grid gap-6">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Tipo</Label>
                  <Select value={formType} onValueChange={setFormType}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o tipo de IA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gemini">Google Gemini</SelectItem>
                      <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                      {/* Adicione mais tipos conforme necessário */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">API Key</Label>
                  <Input id="apiKey" type="password" value={formApiKey} onChange={(e) => setFormApiKey(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="model" className="text-right">Modelo</Label>
                  <Select value={formModel} onValueChange={setFormModel}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {aiModels[formType as keyof typeof aiModels]?.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground ml-2 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{model.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="temperature" className="text-right">Temperatura</Label>
                  <div className="col-span-3">
                    <Slider
                      id="temperature"
                      min={0.0}
                      max={2.0}
                      step={0.1}
                      value={[formTemperature]}
                      onValueChange={(value) => setFormTemperature(value[0])}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formTemperature.toFixed(1)} - Equilibrado entre previsibilidade e criatividade
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prompt" className="text-right">Prompt</Label>
                  <Textarea id="prompt" value={formPrompt} onChange={(e) => setFormPrompt(e.target.value)} className="col-span-3" placeholder="Ex: Você é um assistente prestativo..." />
                </div>
              </div>
              <DialogFooter className="pt-4 border-t">
                <Button type="submit" onClick={handleAddEditIntegration}>Salvar Integração</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {loading && <p className="text-center text-muted-foreground">Carregando integrações...</p>}
        {error && <p className="text-center text-red-500">Erro: {error}</p>}

        {!loading && !error && integrations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <Zap className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="mt-2 text-xl font-semibold text-gray-900">Nenhuma integração encontrada</h3>
            <p className="mt-2 text-base text-gray-600 max-w-md">
              Parece que você ainda não adicionou nenhuma integração. Comece a automatizar seus processos conectando suas primeiras IAs e serviços.
            </p>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddModal} className="mt-6 px-6 py-3 text-lg">
                  <Plus className="mr-2 h-5 w-5" /> Adicionar Minha Primeira Integração
                </Button>
              </DialogTrigger>
              {/* DialogContent remains the same */}
            </Dialog>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader className="border-b pb-4 mb-4">
                <CardTitle className="flex items-center justify-between">
                  <span>{integration.name} ({integration.type})</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(integration)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteIntegration(integration.id)}>
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Criado em: {new Date(integration.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <CheckCircle className="h-4 w-4" /> <span>Status: Ativo</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 font-medium">
                    <XCircle className="h-4 w-4" /> <span>Último Erro: Nenhum</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1">
                    <p className="text-muted-foreground col-span-2"><strong>Modelo:</strong> {integration.config?.model ? aiModels[integration.type as keyof typeof aiModels]?.find(m => m.id === integration.config.model)?.name || integration.config.model : 'N/A'}</p>
                    <p className="text-muted-foreground col-span-2"><strong>Temperatura:</strong> {integration.config?.temperature != null ? integration.config.temperature.toFixed(1) : 'N/A'}</p>
                    <p className="text-muted-foreground col-span-2 max-h-20 overflow-y-auto"><strong>Prompt:</strong> {integration.config?.prompt || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IntegrationsPage;
