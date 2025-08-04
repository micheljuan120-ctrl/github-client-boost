import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

import { Button } from "@/components/ui/button";
import { useAuth } from '../AuthContext';
import { QrCode, Loader2, CheckCircle, XCircle, WifiOff, LogOut, Plus, MessageSquare, Settings } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { InstanceManagementDialog } from '@/components/whatsapp/InstanceManagementDialog';
import { io } from 'socket.io-client'; // Importar socket.io-client

interface WhatsappInstance {
  id: string;
  status: 'disconnected' | 'connecting' | 'connected' | 'qr_received' | 'auth_failure' | 'pending';
  qr_code_data?: string | null;
  created_at?: string;
  name?: string;
}

interface Chat {
  id: { _serialized: string };
  name: string;
  lastMessage?: { body: string };
}

interface Message {
  id: { _serialized: string };
  from: string;
  fromMe: boolean;
  body: string;
  senderName?: string; // Adicionado para exibir o nome do remetente
}

const WhatsappWebChatPage: React.FC = () => {
  const { token } = useAuth();
  const [instances, setInstances] = useState<WhatsappInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isInstanceManagementModalOpen, setIsInstanceManagementModalOpen] = useState<boolean>(false);

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChats, setLoadingChats] = useState<boolean>(false);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const [oldestMessageId, setOldestMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const fetchInstances = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessageText = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorBody);
          errorMessageText = errorData.message || errorMessageText;
        } catch (e) {
          errorMessageText = errorBody || errorMessageText;
        }
        throw new Error(errorMessageText);
      }
      const data = await response.json();
      setInstances(data);
      if (data.length > 0 && !selectedInstanceId) {
        setSelectedInstanceId(data[0].id);
      }
    } catch (err) {
      console.error("Erro ao buscar instâncias:", err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar instâncias.');
    } finally {
      setLoading(false);
    }
  }, [token, selectedInstanceId]);

  const fetchChats = useCallback(async () => {
    if (!token || !selectedInstanceId) return;
    setLoadingChats(true);
    try {
      const response = await fetch(`http://localhost:3001/api/whatsapp/chats?instanceId=${selectedInstanceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setChats(data);
      // Tenta manter o chat selecionado, caso contrário, seleciona o primeiro
      if (selectedChatId && data.some(chat => chat.id._serialized === selectedChatId)) {
        // selectedChatId já está definido e existe na nova lista, não faz nada
      } else {
        setSelectedChatId(data.length > 0 ? data[0].id._serialized : null);
      }
    } catch (err) {
      console.error("Erro ao buscar chats:", err);
      toast({ title: "Erro", description: "Não foi possível carregar os chats.", variant: "destructive" });
    } finally {
      setLoadingChats(false);
    }
  }, [token, selectedInstanceId]);

  const fetchMessages = useCallback(async (loadMore: boolean = false) => {
    if (!token || !selectedInstanceId || !selectedChatId) return;
    setLoadingMessages(true);
    setError(null);

    let url = `http://localhost:3001/api/whatsapp/messages?instanceId=${selectedInstanceId}&chatId=${selectedChatId}`;
    if (loadMore && oldestMessageId) {
      url += `&beforeMessageId=${oldestMessageId}`;
    }

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessageText = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorBody);
          errorMessageText = errorData.message || errorMessageText;
        } catch (e) {
          errorMessageText = errorBody || errorMessageText;
        }
        throw new Error(errorMessageText);
      }
      const data: Message[] = await response.json();

      if (loadMore) {
        setMessages((prevMessages) => [...data, ...prevMessages]);
      } else {
        setMessages(data);
      }

      if (data.length > 0) {
        setOldestMessageId(data[0].id._serialized); // A primeira mensagem retornada é a mais antiga
        setHasMoreMessages(true); // Assumimos que pode haver mais, a menos que o backend diga o contrário
      } else {
        setHasMoreMessages(false);
      }

    } catch (err) {
      console.error("Erro ao buscar mensagens:", err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens.');
      toast({ title: "Erro", description: error || "Não foi possível carregar as mensagens.", variant: "destructive" });
    } finally {
      setLoadingMessages(false);
    }
  }, [token, selectedInstanceId, selectedChatId, oldestMessageId]);

  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:3001', { // Conectar ao seu backend
      auth: {
        token: token,
      },
    });

    socket.on('connect', () => {
      console.log('Conectado ao servidor WebSocket');
      // Entrar em uma sala específica para o usuário
      socket.emit('join_room', { userId: token }); // Assumindo que o token pode ser usado como userId para a sala
    });

    socket.on('whatsapp_message', (data: { instanceId: string, message: Message }) => {
      console.log('Nova mensagem recebida via WebSocket:', data);
      // Verificar se a mensagem pertence à instância e ao chat selecionados
      if (data.instanceId === selectedInstanceId && data.message.from === selectedChatId) {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    });

    socket.on('disconnect', () => {
      console.log('Desconectado do servidor WebSocket');
    });

    socket.on('connect_error', (err) => {
      console.error('Erro de conexão WebSocket:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, selectedInstanceId, selectedChatId]);

  useEffect(() => {
    fetchInstances();
    const instanceInterval = setInterval(fetchInstances, 10000);
    return () => clearInterval(instanceInterval);
  }, [fetchInstances]);

  useEffect(() => {
    if (selectedInstanceId) {
      const currentInstance = instances.find(inst => inst.id === selectedInstanceId);
      if (currentInstance && currentInstance.status === 'connected') {
        fetchChats();
        // Removido o setInterval para evitar loops de requisição excessivos
      } else {
        setChats([]);
        setSelectedChatId(null);
        setMessages([]);
      }
    }
  }, [selectedInstanceId, instances, fetchChats]);

  useEffect(() => {
    if (selectedChatId) {
      setMessages([]); // Limpa as mensagens ao mudar de chat
      setOldestMessageId(null); // Reseta o ID da mensagem mais antiga
      setHasMoreMessages(true); // Assume que há mais mensagens para o novo chat
      fetchMessages(false); // Busca as mensagens iniciais para o novo chat
    } else {
      setMessages([]);
      setOldestMessageId(null);
      setHasMoreMessages(true);
    }
  }, [selectedChatId]); // Depende apenas de selectedChatId

  const handleConnect = useCallback(async (instanceIdToConnect: string | null = null, name: string | null = null) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ instanceId: instanceIdToConnect, name }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessageText = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorBody);
          errorMessageText = errorData.message || errorMessageText;
        } catch (e) {
          errorMessageText = errorBody || errorMessageText;
        }
        throw new Error(errorMessageText);
      }

      const data = await response.json();
      toast({ title: "Conexão WhatsApp", description: data.message, variant: data.status === 'qr_received' ? "info" : "default" });
      fetchInstances();
      if (data.instanceId) {
        setSelectedInstanceId(data.instanceId);
      }
    } catch (err) {
      console.error("Erro ao conectar:", err);
      setError(err instanceof Error ? err.message : 'Erro ao conectar ao WhatsApp.');
      toast({ title: "Erro de Conexão", description: error || "Não foi possível conectar ao WhatsApp.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, error, fetchInstances, toast, setSelectedInstanceId]);

  const handleDisconnect = useCallback(async (instanceIdToDisconnect: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ instanceId: instanceIdToDisconnect }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessageText = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorBody);
          errorMessageText = errorData.message || errorMessageText;
        } catch (e) {
          errorMessageText = errorBody || errorMessageText;
        }
        throw new Error(errorMessageText);
      }

      const data = await response.json();
      toast({ title: "Desconexão WhatsApp", description: data.message, variant: "info" });
      fetchInstances();
    } catch (err) {
      console.error("Erro ao desconectar:", err);
      setError(err instanceof Error ? err.message : 'Erro ao desconectar.');
      toast({ title: "Erro", description: error || "Não foi possível desconectar.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, error, fetchInstances, toast]);

  const handleLogout = useCallback(async (instanceIdToLogout: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    if (!window.confirm('Tem certeza que deseja encerrar a sessão e remover esta instância?')) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:3001/api/whatsapp/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ instanceId: instanceIdToLogout }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessageText = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorBody);
          errorMessageText = errorData.message || errorMessageText;
        } catch (e) {
          errorMessageText = errorBody || errorMessageText;
        }
        throw new Error(errorMessageText);
      }

      const data = await response.json();
      toast({ title: "Sessão Encerrada", description: data.message, variant: "success" });
      fetchInstances();
      setSelectedInstanceId(null);
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
      setError(err instanceof Error ? err.message : 'Erro ao encerrar sessão.');
      toast({ title: "Erro", description: error || "Não foi possível encerrar a sessão.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, error, fetchInstances, toast, setSelectedInstanceId]);

  const handleDeleteInstance = useCallback(async (instanceIdToDelete: string) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    if (!window.confirm('Tem certeza que deseja excluir esta instância? Esta ação é irreversível.')) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/whatsapp/${instanceIdToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessageText = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorBody);
          errorMessageText = errorData.message || errorMessageText;
        } catch (e) {
          errorMessageText = errorBody || errorMessageText;
        }
        throw new Error(errorMessageText);
      }

      toast({ title: "Instância Excluída", description: "A instância foi removida com sucesso.", variant: "success" });
      fetchInstances();
      setSelectedInstanceId(null);
      setIsInstanceManagementModalOpen(false); // Close modal after deletion
    } catch (err) {
      console.error("Erro ao excluir instância:", err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir instância.');
      toast({ title: "Erro", description: error || "Não foi possível excluir a instância.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token, fetchInstances]);

  const selectedInstance = instances.find(inst => inst.id === selectedInstanceId);
  const selectedChat = chats.find(chat => chat.id === selectedChatId);

  return (
    <DashboardLayout>
      <div className="w-full flex-1 flex flex-col text-foreground">
        <div className="flex flex-row items-center justify-between pb-1 border-b border-border bg-card p-1">
          <h2 className="text-xl font-bold text-foreground">WhatsApp</h2>
          <Button onClick={() => setIsInstanceManagementModalOpen(true)} variant="outline" className="rounded-xl border-border text-foreground hover:bg-secondary hover:text-secondary-foreground">
            <Settings className="mr-1 h-1 w-1" /> Gerenciar Instâncias
          </Button>
        </div>
        <div className="flex-grow flex flex-col bg-whatsappChat-background text-foreground">
          {selectedInstance && selectedInstance.status === 'connected' ? (
            <div className="flex h-full flex-1">
              {/* Chat List Area (Left) */}
              <div className="w-80 border-r border-border p-4">
                <h1 className="text-xl font-semibold mb-4 text-foreground">Chats</h1>
                {loadingChats ? (
                  <p className="text-muted-foreground">Carregando chats...</p>
                ) : (
                  <ScrollArea className="h-[calc(100vh - 180px)]"> {/* Ajuste de altura para scroll independente */}
                    {chats.length > 0 ? (
                      chats.map(chat => (
                        <div
                          key={chat.id._serialized}
                          className={`p-3 mb-2 rounded-lg cursor-pointer ${selectedChatId === chat.id._serialized ? 'bg-primary/20' : 'hover:bg-secondary'}`}
                          onClick={() => setSelectedChatId(chat.id._serialized)}
                        >
                          <p className="font-medium text-foreground">{chat.name || chat.id._serialized}</p>
                          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.body || 'Nenhuma mensagem'}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nenhum chat encontrado.</p>
                    )}
                  </ScrollArea>
                )}
              </div>

              {/* Message View Area (Right) */}
              <div className="flex-1 flex flex-col p-4">
                {selectedChatId ? (
                  <>
                    <h3 className="text-xl font-semibold mb-4 text-foreground">{selectedChat?.name || selectedChat?.id?._serialized}</h3>
                    <ScrollArea className="flex-grow p-4" style={{ height: 'calc(100vh - 250px)' }}> {/* Ajuste de altura para scroll independente */}
                      {hasMoreMessages && !loadingMessages && messages.length > 0 && (
                        <div className="text-center py-2">
                          <Button
                            onClick={() => fetchMessages(true)}
                            variant="ghost"
                            className="text-primary hover:text-primary-foreground"
                          >
                            Carregar mais mensagens
                          </Button>
                        </div>
                      )}
                      {loadingMessages && messages.length === 0 ? (
                        <p className="text-muted-foreground">Carregando mensagens...</p>
                      ) : (
                        messages.length > 0 ? (
                          messages.map(message => (
                            <div key={message.id._serialized} className={`mb-2 p-2 rounded-lg max-w-[70%] ${message.fromMe ? 'bg-whatsappChat-bubbleSent text-whatsappChat-textDark rounded-br-none ml-auto' : 'bg-whatsappChat-bubbleReceived text-whatsappChat-textDark rounded-bl-none mr-auto'}`}>
                              <p className="text-xs text-whatsappChat-textLight">{message.senderName || message.from}:</p>
                              <p className="text-sm">{message.body}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">Nenhuma mensagem neste chat.</p>
                        )
                      )}
                      <div ref={messagesEndRef} /> {/* Ref para rolagem automática */}
                    </ScrollArea>
                    {/* Message Input */}
                    <div className="mt-4 flex gap-2 p-4 border-t border-border bg-card"> {/* Adicionado padding e borda */}
                      <Input placeholder="Digite sua mensagem..." className="flex-grow rounded-xl bg-input border-border text-foreground placeholder:text-muted-foreground" />
                      <Button className="rounded-xl bg-gradient-dark-primary text-primary-foreground hover:opacity-90">Enviar</Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground flex-grow flex flex-col items-center justify-center">
                    <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-lg">Selecione um chat para ver as conversas.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Existing content for non-connected instances or no selected instance
            <div className="flex flex-col items-center justify-center w-full h-full">
              {!selectedInstance && (
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="mx-auto h-2 w-2 text-muted-foreground mb-4" />
                  <p className="text-lg">Selecione uma conta WhatsApp para ver os detalhes e iniciar o chat.</p>
                  <Button onClick={() => setIsInstanceManagementModalOpen(true)} className="mt-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                    <Settings className="mr-2 h-2 w-2" /> Gerenciar Instâncias
                  </Button>
                </div>
              )}

              {selectedInstance && selectedInstance.status === 'qr_received' && selectedInstance.qr_code_data && (
                <div className="flex flex-col items-center space-y-4">
                  <img src={selectedInstance.qr_code_data} alt="QR Code" className="w-64 h-64 border border-border p-2 rounded-2xl shadow-md" />
                  <p className="text-muted-foreground">Escaneie este QR Code com seu celular.</p>
                  <p className="text-sm text-muted-foreground">Aguardando conexão...</p>
                </div>
              )}

              {selectedInstance && (selectedInstance.status === 'disconnected' || selectedInstance.status === 'auth_failure' || selectedInstance.status === 'pending') && (
                <div className="flex flex-col items-center space-y-4 text-foreground">
                  <WifiOff className="h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-semibold">Status: {translateStatus(selectedInstance.status)}</p>
                  <p className="text-muted-foreground">Esta conta não está ativa ou precisa de atenção.</p>
                  <div className="flex gap-2 mt-4">
                    {(selectedInstance.status === 'disconnected' || selectedInstance.status === 'auth_failure') && (
                      <Button onClick={() => handleConnect(selectedInstance.id)} size="sm" disabled={loading} className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                        <QrCode className="mr-1 h-4 w-4" /> Reconectar
                      </Button>
                    )}
                    <Button onClick={() => handleLogout(selectedInstance.id)} variant="destructive" size="sm" disabled={loading} className="rounded-xl">
                      <LogOut className="mr-1 h-4 w-4" /> Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Modal de Gerenciamento de Instâncias */}
      <InstanceManagementDialog
        isOpen={isInstanceManagementModalOpen}
        onOpenChange={setIsInstanceManagementModalOpen}
        instances={instances}
        loading={loading}
        error={error}
        onConnect={handleConnect}
        onDelete={handleDeleteInstance}
        onSelectInstance={setSelectedInstanceId}
        selectedInstanceId={selectedInstanceId}
      />
    </DashboardLayout>
  );
};

export default WhatsappWebChatPage;
