import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import client from '../api/client';
import { colors, typography } from '../constants/theme';

import { useLayoutEffect } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TeamMatchesScreen({ route, navigation }) {
  const { team } = route.params;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: team.teamName,
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 12 }}>
          <Ionicons name="arrow-back" size={24} color={colors.accent} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        team.teamCrest ? <Image source={{ uri: team.teamCrest }} style={{ width: 32, height: 32, marginRight: 12 }} /> : null
      ),
      headerStyle: { backgroundColor: colors.surface1 },
      headerTitleStyle: { color: colors.accent, ...typography.h3 },
    });
  }, [navigation, team]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/football/teams/${team.teamApiId}/matches`);
      setMatches(res.data.matches || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getStatusLabel = (status) => {
    if (status === 'IN_PLAY' || status === 'LIVE') return '● LIVE';
    if (status === 'FINISHED') return 'Terminé';
    if (status === 'PAUSED') return 'Mi-temps';
    return 'À venir';
  };

  const getStatusStyle = (status) => {
    if (status === 'IN_PLAY' || status === 'LIVE') return { color: colors.live };
    if (status === 'FINISHED') return { color: colors.success };
    return { color: '#888' };
  };

  const renderMatch = ({ item }) => (
    <View style={styles.matchPreviewCard}>
      <View style={styles.matchPreviewRow}>
        <View style={styles.matchPreviewTeamBox}>
          {item.homeTeam?.crest ? (
            <Image source={{ uri: item.homeTeam.crest }} style={styles.matchPreviewLogo} />
          ) : null}
          <Text style={styles.matchPreviewTeamName} numberOfLines={1}>{item.homeTeam?.name}</Text>
        </View>
        <View style={styles.matchPreviewScoreBox}>
          <Text style={styles.matchPreviewScore}>
            {item.score?.fullTime?.home ?? ''} - {item.score?.fullTime?.away ?? ''}
          </Text>
          <Text style={[styles.statusText, getStatusStyle(item.status)]}>
            {getStatusLabel(item.status)}
          </Text>
        </View>
        <View style={styles.matchPreviewTeamBox}>
          {item.awayTeam?.crest ? (
            <Image source={{ uri: item.awayTeam.crest }} style={styles.matchPreviewLogo} />
          ) : null}
          <Text style={styles.matchPreviewTeamName} numberOfLines={1}>{item.awayTeam?.name}</Text>
        </View>
      </View>
      <Text style={styles.matchDate}>{formatDate(item.utcDate)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMatch}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // paddingTop: 56, // supprimé pour remonter la liste
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
  listContent: {
    padding: 16,
  },
  matchCard: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  teamName: {
    flex: 1,
    ...typography.h5,
    color: colors.text,
  },
  scoreBox: {
    minWidth: 60,
    alignItems: 'center',
  },
  scoreText: {
    ...typography.h4,
    color: colors.accent,
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
  },
  matchDate: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
    matchPreviewCard: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 12,
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
