import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, MessageSquare, CheckCircle, XCircle, WifiOff, Loader2, Trash2 } from 'lucide-react';

interface WhatsappInstance {
  id: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'qr_received' | 'auth_failure' | 'pending';
  qr_code_data?: string | null;
  created_at?: string;
  name?: string;
}

interface InstanceManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  instances: WhatsappInstance[];
  loading: boolean;
  error: string | null;
  onConnect: (instanceId: string | null, name: string | null) => Promise<void>;
  onDelete: (instanceId: string) => Promise<void>;
  onSelectInstance: (instanceId: string) => void;
  selectedInstanceId: string | null;
}

const translateStatus = (status: WhatsappInstance['status']): string => {
  switch (status) {
    case 'disconnected': return 'Desconectado';
    case 'connecting': return 'Conectando';
    case 'connected': return 'Conectado';
    case 'qr_received': return 'QR Code Recebido';
    case 'auth_failure': return 'Falha de Autenticação';
    case 'pending': return 'Pendente';
    default: return status;
  }
};

export const InstanceManagementDialog: React.FC<InstanceManagementDialogProps> = ({
  isOpen,
  onOpenChange,
  instances,
  loading,
  error,
  onConnect,
  onDelete,
  onSelectInstance,
  selectedInstanceId,
}) => {
  const [newInstanceName, setNewInstanceName] = useState<string>('');

  const handleAddInstance = async () => {
    await onConnect(null, newInstanceName);
    setNewInstanceName('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card text-foreground rounded-3xl border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Configuração de Múltiplas Instâncias</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Gerencie múltiplos números de WhatsApp facilmente. Selecione uma conta para alternar ou configure uma nova sem precisar abrir várias instâncias.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <h3 className="text-md font-semibold text-foreground">Instâncias Configuradas:</h3>
          {loading && <p className="text-center text-muted-foreground">Carregando instâncias...</p>}
          {error && <p className="text-center text-destructive">Erro: {error}</p>}

          {!loading && !error && instances.length === 0 && (
            <p className="text-center text-muted-foreground">Nenhuma instância configurada.</p>
          )}

          {!loading && !error && instances.length > 0 && (
            <ScrollArea className="h-48 border border-border rounded-xl p-2 bg-background">
              {instances.map((instance) => (
                <div
                  key={instance.id}
                  className={`flex items-center justify-between p-2 mb-2 border border-border rounded-xl cursor-pointer transition-colors ${selectedInstanceId === instance.id ? 'bg-primary/20 border-primary text-primary-foreground' : 'hover:bg-secondary'}`}
                  onClick={() => onSelectInstance(instance.id)}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{instance.name || `Conta ${instance.id.substring(0, 8)}...`}</p>
                      <p className="text-xs text-muted-foreground">{translateStatus(instance.status)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {instance.status === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {instance.status === 'qr_received' && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />} 
                    {instance.status === 'disconnected' && <WifiOff className="h-4 w-4 text-muted-foreground" />} 
                    {instance.status === 'auth_failure' && <XCircle className="h-4 w-4 text-destructive" />} 
                    {(instance.status === 'disconnected' || instance.status === 'qr_received' || instance.status === 'auth_failure' || instance.status === 'pending' || instance.status === 'connected') && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(instance.id);
                        }}
                        className="text-destructive hover:bg-destructive/20 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}

          <Separator className="my-2 bg-border" />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-instance-name" className="text-right text-foreground">
              Nome
            </Label>
            <Input
              id="new-instance-name"
              value={newInstanceName}
              onChange={(e) => setNewInstanceName(e.target.value)}
              className="col-span-3 rounded-xl bg-input border-border text-foreground placeholder:text-muted-foreground"
              placeholder="Nome para a nova configuração (opcional)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleAddInstance} disabled={loading} className="rounded-xl bg-gradient-dark-primary text-primary-foreground hover:opacity-90">
            <Plus className="mr-2 h-4 w-4" /> Criar Nova Conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
