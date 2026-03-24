import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import { colors, typography } from '../constants/theme';

const TABS = ['Matchs', 'Classement', 'Buteurs'];

export default function LeagueScreen({ route, navigation }) {
  const { code, name, matchday: initialMatchday } = route.params;
  const [activeTab, setActiveTab] = useState('Matchs');
  const [matchday, setMatchday] = useState(initialMatchday || 1);
    const groupMatchesByDate = (matches) => {
      return matches.reduce((acc, m) => {
        const dateKey = m.utcDate
          ? new Date(m.utcDate).toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })
          : 'Date inconnue';
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(m);
        return acc;
      }, {});
    };
  const [maxMatchday, setMaxMatchday] = useState(38);
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await client.get('/favorites');
      setFavorites(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const isFavorite = (team) => {
    return favorites.some(fav => fav.teamApiId === team.id);
  };

  const toggleFavorite = async (team) => {
    try {
      await client.post('/favorites/toggle', {
        teamApiId: team.id,
        teamName: team.name,
        teamTla: team.tla,
        teamCrest: team.crest,
      });
      fetchFavorites();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [matchday]);

  useEffect(() => {
    if (activeTab === 'Classement' && standings.length === 0) fetchStandings();
    if (activeTab === 'Buteurs' && scorers.length === 0) fetchScorers();
  }, [activeTab]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/football/competitions/${code}/matches?matchday=${matchday}`);
      setMatches(res.data.matches || []);
      if (res.data.filters?.availableMatchdays) {
        setMaxMatchday(Math.max(...res.data.filters.availableMatchdays));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStandings = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/football/competitions/${code}/standings`);
      setStandings(res.data.standings?.[0]?.table || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchScorers = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/football/competitions/${code}/scorers?limit=20`);
      setScorers(res.data.scorers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'IN_PLAY' || status === 'LIVE') return { color: colors.live };
    if (status === 'FINISHED') return { color: colors.success };
    return { color: '#888' };
  };

  const getStatusLabel = (status) => {
    if (status === 'IN_PLAY' || status === 'LIVE') return '● LIVE';
    if (status === 'FINISHED') return 'Terminé';
    if (status === 'PAUSED') return 'Mi-temps';
    return 'Programmé';
  };

  const renderMatch = ({ item }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('Match', { matchId: item.id })}
    >
      <View style={styles.matchRow}>
        <View style={styles.teamRow}>
          {item.homeTeam?.crest && (
            <Image source={{ uri: item.homeTeam.crest }} style={styles.crest} />
          )}
          <Text style={styles.teamName} numberOfLines={1}>{item.homeTeam?.name}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>
            {item.score?.fullTime?.home ?? ' '} - {item.score?.fullTime?.away ?? ' '}
          </Text>
          <Text style={[styles.statusText, getStatusStyle(item.status)]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
        <View style={[styles.teamRow, { justifyContent: 'flex-end' }]}>
          <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>
            {item.awayTeam?.name}
          </Text>
          {item.awayTeam?.crest && (
            <Image source={{ uri: item.awayTeam.crest }} style={styles.crest} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStanding = ({ item, index }) => (
    <View style={[styles.standingRow, index % 2 === 0 && styles.standingRowAlt, styles.standingCard]}>
      <TouchableOpacity
        onPress={() => toggleFavorite(item.team)}
        style={{ marginRight: 8 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={{ fontSize: 20, color: isFavorite(item.team) ? colors.accent : '#bbb' }}>
          {isFavorite(item.team) ? '★' : '☆'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.standingPos}>{item.position}</Text>
      {item.team?.crest && (
        <Image source={{ uri: item.team.crest }} style={styles.crestSmall} />
      )}
      <Text style={styles.standingTeam} numberOfLines={1}>{item.team?.name}</Text>
      <View style={styles.standingStatsBox}>
        <Text style={styles.standingStat}>{item.playedGames}</Text>
        <Text style={[styles.standingStat, { color: '#2ecc40' }]}>{item.won}</Text>
        <Text style={[styles.standingStat, { color: '#f1c40f' }]}>{item.draw}</Text>
        <Text style={[styles.standingStat, { color: '#e74c3c' }]}>{item.lost}</Text>
      </View>
      <View style={styles.standingPointsBox}>
        <Text style={styles.standingPoints}>{item.points}</Text>
      </View>
    </View>
  );

  const renderScorer = ({ item, index }) => (
    <View style={[styles.scorerRow, index % 2 === 0 && styles.standingRowAlt]}>
      <Text style={styles.standingPos}>{index + 1}</Text>
      {item.team?.crest && (
        <Image source={{ uri: item.team.crest }} style={styles.crestSmall} />
      )}
      <Text style={styles.standingTeam} numberOfLines={1}>
        {item.player?.name}
      </Text>
      <View style={styles.statsBox}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{item.goals}</Text>
          <Text style={styles.statLabel}>buts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#fff' }]}>{item.assists ?? 0}</Text>
          <Text style={styles.statLabel}>passes</Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }

    if (activeTab === 'Matchs') {
      const grouped = groupMatchesByDate(matches);
      const flatData = [];
      Object.entries(grouped).forEach(([date, dayMatches]) => {
        flatData.push({ type: 'header', date, count: dayMatches.length });
        dayMatches.forEach((m) => flatData.push({ type: 'match', match: m }));
      });

      const renderItem = ({ item }) => {
        if (item.type === 'header') {
          return (
            <Text style={{ ...typography.label, color: colors.text, marginVertical: 8 }}>
              {item.date}
            </Text>
          );
        }
        if (item.type === 'match') {
          return renderMatch({ item: item.match });
        }
        return null;
      };

      return (
        <>
          <View style={styles.journeyNav}>
            <TouchableOpacity
              onPress={() => setMatchday((p) => Math.max(1, p - 1))}
              disabled={matchday === 1}
            >
              <Text style={[styles.navArrow, matchday === 1 && styles.disabled]}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.journeyText}>Journée {matchday}</Text>
            <TouchableOpacity
              onPress={() => setMatchday((p) => Math.min(maxMatchday, p + 1))}
              disabled={matchday === maxMatchday}
            >
              <Text style={[styles.navArrow, matchday === maxMatchday && styles.disabled]}>›</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={flatData}
            keyExtractor={(item, i) => item.type === 'header' ? `header-${item.date}` : item.match.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      );
    }

    if (activeTab === 'Classement') {
      return (
        <>
          <View style={styles.standingHeader}>
            <Text style={[styles.standingPos, { color: colors.accent }]}>#</Text>
            <Text style={[styles.standingTeam, { color: colors.accent }]}>Équipe</Text>
            <Text style={[styles.standingStat, { color: colors.accent }]}>J</Text>
            <Text style={[styles.standingStat, { color: colors.accent }]}>G</Text>
            <Text style={[styles.standingStat, { color: colors.accent }]}>N</Text>
            <Text style={[styles.standingStat, { color: colors.accent }]}>P</Text>
            <Text style={[styles.standingStat, { color: colors.accent }]}>Pts</Text>
          </View>
          <FlatList
            data={standings}
            keyExtractor={(item) => item.position.toString()}
            renderItem={renderStanding}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      );
    }

    if (activeTab === 'Buteurs') {
      return (
        <FlatList
          data={scorers.slice(0, 20)}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderScorer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{name}</Text>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  back: {
    color: colors.accent,
    ...typography.data,
    marginBottom: 8,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  tabText: {
    ...typography.data,
    color: '#888',
  },
  tabTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  journeyNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 12,
    backgroundColor: colors.surface2,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  navArrow: {
    color: colors.accent,
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: colors.background,
    overflow: 'hidden',
    minWidth: 32,
    textAlign: 'center',
  },
  disabled: {
    color: '#444',
  },
  journeyText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: colors.surface2,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  crest: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  crestSmall: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 6,
  },
  teamName: {
    ...typography.data,
    color: colors.text,
    flex: 1,
  },
  scoreBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scoreText: {
    ...typography.data,
    color: colors.accent,
    fontWeight: '700',
  },
  statusText: {
    ...typography.label,
    marginTop: 2,
  },
  standingHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 8,
  },
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface1,
  },
  standingRowAlt: {
    backgroundColor: colors.surface2,
  },
  standingCard: {
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  standingPos: {
    ...typography.label,
    color: colors.text,
    width: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  standingTeam: {
    ...typography.data,
    color: colors.text,
    flex: 1,
    marginLeft: 4,
  },
  standingStatsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 8,
  },
  standingStat: {
    ...typography.label,
    color: colors.text,
    width: 28,
    textAlign: 'center',
    fontWeight: '600',
  },
  standingPointsBox: {
    marginLeft: 8,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  standingPoints: {
    ...typography.h3,
    color: colors.accent,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scorerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  teamNameSmall: {
    ...typography.label,
    color: '#888',
    width: 80,
  },
  statsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    ...typography.h3,
    color: colors.accent,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  statLabel: {
    ...typography.label,
    color: '#666',
    fontSize: 12,
    marginTop: -2,
  },
});