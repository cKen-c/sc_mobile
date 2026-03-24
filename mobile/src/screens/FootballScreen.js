import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import client from '../api/client';
import { colors, typography } from '../constants/theme';

const LEAGUES = [
  { code: 'PL', name: 'Premier League', country: 'Angleterre' },
  { code: 'PD', name: 'La Liga', country: 'Espagne' },
  { code: 'FL1', name: 'Ligue 1', country: 'France' },
];

export default function FootballScreen({ navigation }) {
  const [leagues, setLeagues] = useState([]);
  const [matchesByLeague, setMatchesByLeague] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const leagueDetails = await Promise.all(
        LEAGUES.map((l) => client.get(`/football/competitions/${l.code}`))
      );
      setLeagues(leagueDetails.map((r) => r.data));

      const results = await Promise.all(
        LEAGUES.map(async (league) => {
          const res = await client.get(`/football/competitions/${league.code}/matches`);
          let matches = res.data.matches || [];
          const live = matches.filter(m => m.status === 'IN_PLAY' || m.status === 'LIVE').sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
          const finished = matches.filter(m => m.status === 'FINISHED').sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));
          const upcoming = matches.filter(m => m.status !== 'FINISHED' && m.status !== 'IN_PLAY' && m.status !== 'LIVE').sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
          const previewMatches = [...live, ...finished.slice(0, 3), ...upcoming.slice(0, 2)].slice(0, 5);
          return { code: league.code, matches: previewMatches };
        })
      );
      const map = {};
      results.forEach(({ code, matches }) => { map[code] = matches; });
      setMatchesByLeague(map);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'IN_PLAY' || status === 'LIVE') return { color: colors.live };
    if (status === 'FINISHED') return { color: colors.success };
    return { color: colors.text };
  };

  const getStatusLabel = (status) => {
    if (status === 'IN_PLAY' || status === 'LIVE') return 'LIVE';
    if (status === 'FINISHED') return 'Terminé';
    if (status === 'PAUSED') return 'Mi-temps';
    return 'Programmé';
  };

  const renderMatch = (match) => (
    <TouchableOpacity
      key={match.id}
      style={styles.matchPreviewCard}
      onPress={() => navigation.navigate('Match', { matchId: match.id })}
    >
      <View style={styles.matchPreviewRow}>
        <View style={styles.matchPreviewTeamBox}>
          {match.homeTeam?.crest ? (
            <Image source={{ uri: match.homeTeam.crest }} style={styles.matchPreviewLogo} />
          ) : null}
          <Text style={styles.matchPreviewTeamName} numberOfLines={1}>{match.homeTeam?.name}</Text>
        </View>
        <View style={styles.matchPreviewScoreBox}>
          <Text style={styles.matchPreviewScore}>
            {match.score?.fullTime?.home ?? ' '} - {match.score?.fullTime?.away ?? ' '}
          </Text>
          <Text style={[styles.status, getStatusStyle(match.status)]}>
            {getStatusLabel(match.status)}
          </Text>
        </View>
        <View style={styles.matchPreviewTeamBox}>
          {match.awayTeam?.crest ? (
            <Image source={{ uri: match.awayTeam.crest }} style={styles.matchPreviewLogo} />
          ) : null}
          <Text style={styles.matchPreviewTeamName} numberOfLines={1}>{match.awayTeam?.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  const renderLeague = ({ item, index }) => {
    const league = LEAGUES[index];
    const matches = matchesByLeague[league.code] || [];
    const currentMatchday = item.currentSeason?.currentMatchday || 1;

    return (
      <View style={styles.leagueCard}>
        <View style={styles.leagueHeader}>
          {item.emblem && (
            <Image source={{ uri: item.emblem }} style={styles.emblem} />
          )}
          <View>
            <Text style={styles.leagueName}>{item.name || league.name}</Text>
            <Text style={styles.leagueCountry}>{league.country}</Text>
          </View>
        </View>

        {matches.length > 0
          ? matches.map(renderMatch)
          : <Text style={styles.noMatch}>Aucun match disponible</Text>
        }

        <TouchableOpacity
          style={styles.seeMore}
          onPress={() => navigation.navigate('League', { code: league.code, name: league.name, matchday: currentMatchday })}
        >
          <Text style={styles.seeMoreText}>Voir plus →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Accueil</Text>
      <FlatList
        data={leagues.length > 0 ? leagues : LEAGUES}
        keyExtractor={(_, i) => LEAGUES[i].code}
        renderItem={renderLeague}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageTitle: {
    ...typography.h2,
    color: colors.accent,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  list: {
    padding: 16,
    gap: 16,
  },
  leagueCard: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  leagueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  emblem: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  leagueName: {
    ...typography.h3,
    color: colors.text,
  },
  leagueCountry: {
    ...typography.label,
    color: colors.accent,
    marginTop: 2,
  },
  matchRow: {
    backgroundColor: colors.surface1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  matchTeams: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  teamName: {
    ...typography.data,
    color: colors.text,
    flex: 1,
  },
  score: {
    ...typography.data,
    color: colors.accent,
    fontWeight: '700',
    marginHorizontal: 8,
    textAlign: 'center',
  },
  status: {
    ...typography.label,
    textAlign: 'right',
  },
  noMatch: {
    ...typography.body,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 8,
  },
  seeMore: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  seeMoreText: {
    color: colors.accent,
    ...typography.label,
  },

    matchPreviewCard: {
    backgroundColor: colors.surface1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  matchPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchPreviewTeamBox: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchPreviewLogo: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  matchPreviewTeamName: {
    ...typography.label,
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 70,
  },
  matchPreviewScoreBox: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchPreviewScore: {
    ...typography.body,
    color: colors.accent,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },

});