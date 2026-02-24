import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { useChatStore } from '../../store';

export const ChatListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { conversas: conversations, unreadCount, fetchConversas: fetchConversations, loading } = useChatStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [fetchConversations]);

  const renderConversation = ({ item, index }: { item: any; index: number }) => {
    const hasUnread = item.nao_lidas > 0;
    return (
      <Animated.View entering={FadeInRight.delay(index * 60).duration(300)}>
        <TouchableOpacity
          style={[styles.conversationCard, hasUnread && styles.cardUnread]}
          onPress={() =>
            navigation.navigate('ChatConversation', {
              partnerId: item.parceiro_id || item.usuario_id,
              partnerName: item.parceiro_nome || item.nome,
              conversaId: item.id,
            })
          }
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, hasUnread && styles.avatarUnread]}>
            <Text style={styles.avatarText}>
              {(item.parceiro_nome || item.nome || 'U')[0].toUpperCase()}
            </Text>
            {item.online && <View style={styles.onlineDot} />}
          </View>

          <View style={styles.messageContent}>
            <View style={styles.messageHeader}>
              <Text style={[styles.userName, hasUnread && styles.userNameUnread]} numberOfLines={1}>
                {item.parceiro_nome || item.nome}
              </Text>
              <Text style={[styles.time, hasUnread && styles.timeUnread]}>
                {item.ultima_mensagem_hora || ''}
              </Text>
            </View>
            <Text
              style={[styles.lastMessage, hasUnread && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {item.ultima_mensagem || 'Inicie uma conversa'}
            </Text>
          </View>

          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.nao_lidas}</Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Chat</Text>
        {unreadCount > 0 && (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => String(item.usuario_id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>Sem conversas</Text>
            <Text style={styles.emptyText}>
              Adicione amigos para começar a conversar!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  cardUnread: {
    backgroundColor: colors.bgCard,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryGlow,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarUnread: {
    borderColor: colors.primary,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.lg,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.bgPrimary,
  },
  messageContent: {
    flex: 1,
    gap: spacing.xs,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
  userNameUnread: {
    fontWeight: fontWeight.bold,
  },
  time: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  timeUnread: {
    color: colors.primary,
  },
  lastMessage: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
  lastMessageUnread: {
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  unreadText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing['4xl'] * 2,
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 56,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
    paddingHorizontal: spacing['2xl'],
  },
});
