import { create } from 'zustand';
import { chatService, Conversa, Mensagem } from '../services/chat.service';

interface ChatState {
  conversas: Conversa[];
  currentChat: Mensagem[];
  currentPartnerId: number | null;
  unreadCount: number;
  loading: boolean;
  pollingActive: boolean;

  fetchConversas: () => Promise<void>;
  fetchHistorico: (amigoId: number) => Promise<void>;
  sendMessage: (destinatarioId: number, conteudo: string, tipo?: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  setCurrentPartner: (id: number | null) => void;
  startPolling: (amigoId: number) => void;
  stopPolling: () => void;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;

export const useChatStore = create<ChatState>((set, get) => ({
  conversas: [],
  currentChat: [],
  currentPartnerId: null,
  unreadCount: 0,
  loading: false,
  pollingActive: false,

  fetchConversas: async () => {
    try {
      const data = await chatService.getConversas();
      set({ conversas: Array.isArray(data) ? data : data.conversas || [] });
    } catch {
      // silent
    }
  },

  fetchHistorico: async (amigoId: number) => {
    try {
      const data = await chatService.getHistorico(amigoId);
      set({ currentChat: Array.isArray(data) ? data : data.mensagens || [] });
    } catch {
      // silent
    }
  },

  sendMessage: async (destinatarioId: number, conteudo: string, tipo = 'text') => {
    try {
      await chatService.enviarMensagem(destinatarioId, conteudo, tipo);
      // Refresh history
      await get().fetchHistorico(destinatarioId);
    } catch {
      throw new Error('Erro ao enviar mensagem');
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await chatService.contarNaoLidas();
      set({ unreadCount: data.total || data.nao_lidas || 0 });
    } catch {
      // silent
    }
  },

  setCurrentPartner: (id) => set({ currentPartnerId: id }),

  startPolling: (amigoId: number) => {
    get().stopPolling();
    set({ pollingActive: true, currentPartnerId: amigoId });

    pollingInterval = setInterval(async () => {
      if (get().pollingActive && get().currentPartnerId === amigoId) {
        await get().fetchHistorico(amigoId);
      }
    }, 3000);
  },

  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({ pollingActive: false });
  },
}));
