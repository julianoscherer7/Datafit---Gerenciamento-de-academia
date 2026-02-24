import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { useChatStore } from '../../store';
import { chatService } from '../../services';

export const ChatConversationScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const { partnerId, partnerName, conversaId } = route.params;
  const { currentChat: messages, fetchHistorico: fetchMessages, startPolling, stopPolling } = useChatStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    navigation.setOptions?.({
      headerTitle: partnerName || 'Chat',
    });
    fetchMessages(conversaId || partnerId);
    startPolling(conversaId || partnerId);
    return () => stopPolling();
  }, [conversaId, partnerId]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await chatService.enviarMensagem(partnerId, trimmed);
      setText('');
      await fetchMessages(conversaId || partnerId);
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch {}
    setSending(false);
  }, [text, sending, conversaId, partnerId]);

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isMe = item.remetente_id !== partnerId;
    return (
      <Animated.View
        entering={SlideInRight.delay(index * 20).duration(200)}
        style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}
      >
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
            {item.conteudo || item.mensagem}
          </Text>
          <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
            {item.hora || formatTime(item.criado_em)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {(partnerName || 'U')[0].toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerName} numberOfLines={1}>
          {partnerName}
        </Text>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, i) => String(item.id || i)}
        contentContainerStyle={styles.messageList}
        inverted={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Animated.Text entering={FadeIn.duration(400)} style={styles.emptyChatText}>
              👋 Diga olá para {partnerName}!
            </Animated.Text>
          </View>
        }
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Mensagem..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  backBtn: {
    paddingVertical: spacing.xs,
  },
  backText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md,
  },
  headerName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    flex: 1,
  },
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageRow: {
    marginBottom: spacing.sm,
    maxWidth: '80%',
  },
  messageRowRight: {
    alignSelf: 'flex-end',
  },
  messageRowLeft: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  bubbleOther: {
    backgroundColor: colors.bgCard,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTime: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  messageTimeMe: {
    color: 'rgba(255,255,255,0.7)',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['4xl'] * 2,
  },
  emptyChatText: {
    color: colors.textTertiary,
    fontSize: fontSize.lg,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendText: {
    color: '#fff',
    fontSize: 20,
  },
});
