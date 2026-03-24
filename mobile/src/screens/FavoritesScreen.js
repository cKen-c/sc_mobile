import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import client from '../api/client';
import { colors, typography } from '../constants/theme';

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);


  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await client.get('/favorites');
      setFavorites(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (team) => {
    try {
      await client.post('/favorites/toggle', {
        teamApiId: team.teamApiId,
        teamName: team.teamName,
        teamTla: team.teamTla,
        teamCrest: team.teamCrest,
      });
      fetchFavorites();
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'IN_PLAY' || status === 'LIVE') return '● LIVE';
    if (status === 'FINISHED') return 'Terminé';
    if (status === 'PAUSED') return 'Mi-temps';
    return 'Programmé';
  };

  const getStatusStyle = (status) => {
    if (status === 'IN_PLAY' || status === 'LIVE') return { color: colors.live };
    if (status === 'FINISHED') return { color: colors.success };
    return { color: '#888' };
  };

  const renderMatch = (match) => (
    <TouchableOpacity
      key={match.id}
      style={styles.matchCard}
      onPress={() => navigation.navigate('Match', { matchId: match.id })}
    >
      <View style={styles.matchRow}>
        <Text style={styles.teamName} numberOfLines={1}>{match.homeTeam?.name}</Text>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>
            {match.score?.fullTime?.home ?? ''} - {match.score?.fullTime?.away ?? ''}
          </Text>
          <Text style={[styles.statusText, getStatusStyle(match.status)]}>
            {getStatusLabel(match.status)}
          </Text>
        </View>
        <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>
          {match.awayTeam?.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderTeam = ({ item }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => navigation.navigate('TeamMatches', { team: item })}
    >
      <View style={styles.teamHeader}>
        {item.teamCrest ? (
          <Image source={{ uri: item.teamCrest }} style={styles.crest} />
        ) : null}
        <Text style={styles.teamTitle}>{item.teamName}</Text>
        <TouchableOpacity onPress={() => removeFavorite(item)} style={styles.removeBtn}>
          <Text style={styles.removeBtnText}>★ Retirer</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
      <Text style={styles.pageTitle}>★ Mes équipes favorites</Text>
      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucune équipe favorite</Text>
          <Text style={styles.emptySubText}>
            Ajoute des équipes depuis les pages de matchs
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.teamApiId.toString()}
          renderItem={renderTeam}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  listContent: {
    padding: 16,
  },
  teamCard: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  crest: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  teamTitle: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  removeBtn: {
    padding: 6,
  },
  removeBtnText: {
    color: colors.accent,
    ...typography.label,
  },
  sectionLabel: {
    ...typography.label,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  matchCard: {
    backgroundColor: colors.surface1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  noMatch: {
    ...typography.body,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
  },
  emptySubText: {
    ...typography.data,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});