import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../theme';
import { Card, Button } from '../../components/common';
import { amigosService, storiesService } from '../../services';
import type { Amigo } from '../../services';

type Tab = 'stories' | 'feed' | 'ranking' | 'amigos';

export const SocialScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [tab, setTab] = useState<Tab>('feed');
  const [ranking, setRanking] = useState<any[]>([]);
  const [amigos, setAmigos] = useState<Amigo[]>([]);
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [rankingData, amigosData, pendData, feedData] = await Promise.all([
        amigosService.getRanking().catch(() => []),
        amigosService.getAmigos().catch(() => []),
        amigosService.getPendentes().catch(() => []),
        amigosService.getFeed().catch(() => []),
      ]);
      setRanking(Array.isArray(rankingData) ? rankingData : rankingData?.ranking || []);
      setAmigos(Array.isArray(amigosData) ? amigosData : amigosData?.amigos || []);
      setPendentes(Array.isArray(pendData) ? pendData : pendData?.pendentes || []);
      setFeed(Array.isArray(feedData) ? feedData : feedData?.atividades || []);

      try {
        const storiesData = await storiesService.getFeed();
        setStories(Array.isArray(storiesData) ? storiesData : storiesData?.stories || []);
      } catch {}
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length >= 2) {
      try {
        const data = await amigosService.buscarUsuarios(q);
        setSearchResults(Array.isArray(data) ? data : data?.usuarios || []);
      } catch {}
    } else {
      setSearchResults([]);
    }
  }, []);

  const handleAddFriend = async (userId: number) => {
    try {
      await amigosService.enviarSolicitacao(userId);
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, solicitado: true } : u))
      );
    } catch {}
  };

  const handleAccept = async (amizadeId: number) => {
    try {
      await amigosService.aceitarSolicitacao(amizadeId);
      setPendentes((prev) => prev.filter((p) => p.id !== amizadeId));
      fetchData();
    } catch {}
  };

  const tabs: { key: Tab; label: string; emoji: string }[] = [
    { key: 'feed', label: 'Feed', emoji: '📰' },
    { key: 'stories', label: 'Stories', emoji: '📸' },
    { key: 'ranking', label: 'Ranking', emoji: '🏅' },
    { key: 'amigos', label: 'Amigos', emoji: '👥' },
  ];

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Text style={styles.tabEmoji}>{t.emoji}</Text>
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* FEED TAB */}
        {tab === 'feed' && (
          <>
            {pendentes.length > 0 && (
              <Animated.View entering={FadeInUp.duration(300)}>
                <Card variant="highlight" style={styles.pendingCard}>
                  <Text style={styles.pendingText}>
                    📬 {pendentes.length} solicitação(ões) pendente(s)
                  </Text>
                  <TouchableOpacity onPress={() => setTab('amigos')}>
                    <Text style={styles.pendingLink}>Ver →</Text>
                  </TouchableOpacity>
                </Card>
              </Animated.View>
            )}

            {feed.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📰</Text>
                <Text style={styles.emptyTitle}>Sem atividades recentes</Text>
                <Text style={styles.emptyText}>
                  Adicione amigos para ver suas atividades!
                </Text>
              </View>
            ) : (
              feed.map((item: any, index: number) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(index * 80).duration(300)}
                >
                  <Card style={styles.feedCard}>
                    <View style={styles.feedHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {(item.nome || 'U')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.feedUser}>{item.nome || 'Usuário'}</Text>
                        <Text style={styles.feedTime}>{item.tempo || 'agora'}</Text>
                      </View>
                    </View>
                    <Text style={styles.feedContent}>{item.descricao || item.atividade}</Text>
                  </Card>
                </Animated.View>
              ))
            )}
          </>
        )}

        {/* STORIES TAB */}
        {tab === 'stories' && (
          <>
            <Button
              title="📸 Criar Story"
              onPress={() => navigation.navigate('CreateStory')}
              size="lg"
              fullWidth
            />
            <View style={{ height: spacing.xl }} />
            {stories.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>📸</Text>
                <Text style={styles.emptyTitle}>Nenhum story</Text>
                <Text style={styles.emptyText}>
                  Tire uma foto na academia e compartilhe!
                </Text>
              </View>
            ) : (
              stories.map((userStories: any, index: number) => (
                <Animated.View
                  key={index}
                  entering={FadeInUp.delay(index * 80).duration(300)}
                >
                  <Card style={styles.storyUserCard} pressable onPress={() => {}}>
                    <View style={styles.storyRow}>
                      <View style={[styles.avatar, styles.storyAvatar]}>
                        <Text style={styles.avatarText}>
                          {(userStories.nome || 'U')[0]}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.feedUser}>{userStories.nome}</Text>
                        <Text style={styles.feedTime}>
                          {userStories.stories?.length || 0} story(ies)
                        </Text>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              ))
            )}
          </>
        )}

        {/* RANKING TAB */}
        {tab === 'ranking' && (
          <>
            {/* Top 3 Podium */}
            {ranking.length >= 3 && (
              <Animated.View entering={FadeInUp.duration(400)} style={styles.podium}>
                {/* 2nd place */}
                <View style={[styles.podiumItem, styles.podium2]}>
                  <Text style={styles.podiumMedal}>🥈</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {ranking[1]?.nome?.split(' ')[0]}
                  </Text>
                  <Text style={styles.podiumXp}>{ranking[1]?.xp} XP</Text>
                </View>
                {/* 1st place */}
                <View style={[styles.podiumItem, styles.podium1]}>
                  <Text style={styles.podiumMedal}>🥇</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {ranking[0]?.nome?.split(' ')[0]}
                  </Text>
                  <Text style={styles.podiumXp}>{ranking[0]?.xp} XP</Text>
                </View>
                {/* 3rd place */}
                <View style={[styles.podiumItem, styles.podium3]}>
                  <Text style={styles.podiumMedal}>🥉</Text>
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {ranking[2]?.nome?.split(' ')[0]}
                  </Text>
                  <Text style={styles.podiumXp}>{ranking[2]?.xp} XP</Text>
                </View>
              </Animated.View>
            )}

            {ranking.slice(3).map((user: any, index: number) => (
              <Animated.View
                key={user.id}
                entering={FadeInUp.delay(index * 60).duration(300)}
              >
                <Card style={styles.rankingCard}>
                  <Text style={styles.rankPosition}>{index + 4}º</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.feedUser}>{user.nome}</Text>
                    <Text style={styles.feedTime}>Lv.{user.level || 1}</Text>
                  </View>
                  <Text style={styles.rankXp}>{user.xp} XP</Text>
                </Card>
              </Animated.View>
            ))}
          </>
        )}

        {/* AMIGOS TAB */}
        {tab === 'amigos' && (
          <>
            {/* Search */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 Buscar usuários..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={handleSearch}
              />
            </View>

            {searchResults.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Resultados</Text>
                {searchResults.map((user: any) => (
                  <Card key={user.id} style={styles.userCard}>
                    <View style={styles.feedHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user.nome[0]}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.feedUser}>{user.nome}</Text>
                        <Text style={styles.feedTime}>{user.email}</Text>
                      </View>
                      {!user.solicitado && (
                        <Button
                          title="+ Adicionar"
                          onPress={() => handleAddFriend(user.id)}
                          variant="outline"
                          size="sm"
                        />
                      )}
                    </View>
                  </Card>
                ))}
              </>
            )}

            {/* Pending */}
            {pendentes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>📬 Pendentes</Text>
                {pendentes.map((p: any) => (
                  <Card key={p.id} style={styles.userCard}>
                    <View style={styles.feedHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {(p.solicitante?.nome || p.nome || 'U')[0]}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.feedUser}>
                          {p.solicitante?.nome || p.nome}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                        <Button title="✓" onPress={() => handleAccept(p.id)} size="sm" />
                        <Button
                          title="✕"
                          onPress={() => {}}
                          variant="danger"
                          size="sm"
                        />
                      </View>
                    </View>
                  </Card>
                ))}
              </>
            )}

            {/* Friends List */}
            <Text style={styles.sectionTitle}>👥 Amigos ({amigos.length})</Text>
            {amigos.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={styles.emptyText}>Nenhum amigo ainda</Text>
              </View>
            ) : (
              amigos.map((amigo, i) => (
                <Animated.View key={amigo.id} entering={FadeInUp.delay(i * 60).duration(300)}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('PerfilPublico', { userId: amigo.id })
                    }
                  >
                    <Card style={styles.userCard}>
                      <View style={styles.feedHeader}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>{amigo.nome[0]}</Text>
                          {amigo.online && <View style={styles.onlineDot} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.feedUser}>{amigo.nome}</Text>
                          <Text style={styles.feedTime}>
                            {amigo.online ? '🟢 Online' : '⚫ Offline'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('ChatConversation', {
                              partnerId: amigo.id,
                              partnerName: amigo.nome,
                            })
                          }
                        >
                          <Text style={styles.chatIcon}>💬</Text>
                        </TouchableOpacity>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              ))
            )}
          </>
        )}

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primaryGlow,
  },
  tabEmoji: {
    fontSize: 14,
  },
  tabText: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  pendingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  pendingText: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  pendingLink: {
    color: colors.primaryLight,
    fontSize: fontSize.sm,
  },
  feedCard: {
    marginBottom: spacing.md,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    borderColor: colors.gradientEnd,
    borderWidth: 2,
  },
  avatarText: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
    fontSize: fontSize.md,
  },
  feedUser: {
    color: colors.textPrimary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.md,
  },
  feedTime: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  feedContent: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
  storyUserCard: {
    marginBottom: spacing.md,
  },
  storyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: spacing['2xl'],
    gap: spacing.md,
  },
  podiumItem: {
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: 100,
  },
  podium1: {
    paddingVertical: spacing.xl,
    borderColor: colors.coins,
  },
  podium2: {
    paddingVertical: spacing.lg,
  },
  podium3: {
    paddingVertical: spacing.md,
  },
  podiumMedal: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  podiumName: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  podiumXp: {
    color: colors.xp,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  rankPosition: {
    color: colors.textTertiary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    width: 36,
  },
  rankXp: {
    color: colors.xp,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchInput: {
    backgroundColor: colors.bgInput,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: fontSize.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  userCard: {
    marginBottom: spacing.sm,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.online,
    borderWidth: 2,
    borderColor: colors.bgPrimary,
  },
  chatIcon: {
    fontSize: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
    gap: spacing.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
});
