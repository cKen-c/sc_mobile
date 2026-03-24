import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography } from '../constants/theme';

export default function MatchScreen({ route, navigation }) {
  const { matchId } = route.params;
  const { user } = useAuth();
  const [match, setMatch] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [favoriteHome, setFavoriteHome] = useState(false);
  const [favoriteAway, setFavoriteAway] = useState(false);

  useEffect(() => {
    fetchMatch();
    fetchComments();
  }, []);

  const fetchMatch = async () => {
    try {
      const res = await client.get(`/football/matches/${matchId}`);
      setMatch(res.data);
      checkFavorite(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await client.get(`/comments/match/${matchId}`);
      setComments(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const checkFavorite = async (matchData) => {
    try {
      const res = await client.get('/favorites/ids');
      const ids = res.data || [];
      setFavoriteHome(ids.includes(matchData?.homeTeam?.id));
      setFavoriteAway(ids.includes(matchData?.awayTeam?.id));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async (team, isHome) => {
    try {
      await client.post('/favorites/toggle', {
        teamApiId: team?.id,
        teamName: team?.name,
        teamTla: team?.tla,
        teamCrest: team?.crest,
      });
      if (isHome) {
        setFavoriteHome((prev) => !prev);
      } else {
        setFavoriteAway((prev) => !prev);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendComment = async () => {
    if (!newComment.trim()) return;
    setSending(true);
    try {
      await client.post('/comments', {
        content: newComment,
        matchId: matchId,
        parentId: replyTo?.id || null,
      });
      setNewComment('');
      setReplyTo(null);
      fetchComments();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const likeComment = async (commentId) => {
    try {
      await client.post(`/comments/${commentId}/like`);
      fetchComments();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await client.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (e) {
      console.error(e);
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

  // Affichage récursif des commentaires et édition inline
  const handleEditComment = async (comment) => {
    if (!editingContent.trim()) return;
    setSending(true);
    try {
      await client.put(`/comments/${comment.id}`, { content: editingContent });
      setEditingComment(null);
      setEditingContent('');
      fetchComments();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const renderReplies = (replies) => {
    return replies?.map((reply) => (
      <View key={reply.id} style={styles.replyCard}>
        <View style={styles.commentHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {reply.user?.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.commentUser}>{reply.user?.username}</Text>
            <Text style={styles.commentDate}>
              {new Date(reply.createdAt).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}
              {' à '}
              {new Date(reply.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              {reply.edited && ' · modifié'}
            </Text>
          </View>
        </View>
        {editingComment?.id === reply.id ? (
          <View style={{ marginBottom: 8 }}>
            <TextInput
              style={styles.input}
              value={editingContent}
              onChangeText={setEditingContent}
              multiline
              autoFocus
            />
            <View style={styles.editBtnRow}>
              <TouchableOpacity onPress={() => handleEditComment(reply)} style={[styles.editBtn, styles.editBtnValidate]} disabled={sending}>
                <Text style={styles.editBtnText}>Valider</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditingComment(null); setEditingContent(''); }} style={[styles.editBtn, styles.editBtnCancel]}>
                <Text style={styles.editBtnText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.commentContent}>{reply.content}</Text>
        )}
        <View style={styles.commentActions}>
          <TouchableOpacity onPress={() => likeComment(reply.id)} style={styles.actionBtn}>
            <Text style={styles.actionText}>♥ {reply.likesCount || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setReplyTo(reply)} style={styles.actionBtn}>
            <Text style={styles.actionText}>Répondre</Text>
          </TouchableOpacity>
          {user?.username === reply.user?.username && (
            <>
              <TouchableOpacity onPress={() => { setEditingComment(reply); setEditingContent(reply.content); }} style={styles.actionBtn}>
                <Text style={[styles.actionText, { color: colors.accent }]}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteComment(reply.id)} style={styles.actionBtn}>
                <Text style={[styles.actionText, { color: colors.live }]}>Supprimer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* Affichage récursif */}
        {reply.replies && reply.replies.length > 0 && (
          <View>{renderReplies(reply.replies)}</View>
        )}
      </View>
    ));
  };

  const renderComment = ({ item }) => (
    <View style={[styles.commentCard, item.parentId && styles.replyCard]}>
      <View style={styles.commentHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.user?.username?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.commentUser}>{item.user?.username}</Text>
          <Text style={styles.commentDate}>
            {new Date(item.createdAt).toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' })}
            {' à '}
            {new Date(item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            {item.edited && ' · modifié'}
          </Text>
        </View>
      </View>

      {editingComment?.id === item.id ? (
        <View style={{ marginBottom: 8 }}>
          <TextInput
            style={styles.input}
            value={editingContent}
            onChangeText={setEditingContent}
            multiline
            autoFocus
          />
          <View style={styles.editBtnRow}>
            <TouchableOpacity onPress={() => handleEditComment(item)} style={[styles.editBtn, styles.editBtnValidate]} disabled={sending}>
              <Text style={styles.editBtnText}>Valider</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditingComment(null); setEditingContent(''); }} style={[styles.editBtn, styles.editBtnCancel]}>
              <Text style={styles.editBtnText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.commentContent}>{item.content}</Text>
      )}

      <View style={styles.commentActions}>
        <TouchableOpacity onPress={() => likeComment(item.id)} style={styles.actionBtn}>
          <Text style={styles.actionText}>♥ {item.likesCount || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setReplyTo(item)} style={styles.actionBtn}>
          <Text style={styles.actionText}>Répondre</Text>
        </TouchableOpacity>
        {user?.username === item.user?.username && (
          <>
            <TouchableOpacity onPress={() => { setEditingComment(item); setEditingContent(item.content); }} style={styles.actionBtn}>
              <Text style={[styles.actionText, { color: colors.accent }]}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteComment(item.id)} style={styles.actionBtn}>
              <Text style={[styles.actionText, { color: colors.live }]}>Supprimer</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Affichage récursif des réponses */}
      {item.replies && item.replies.length > 0 && (
        <View>{renderReplies(item.replies)}</View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const home = match?.homeTeam;
  const away = match?.awayTeam;
  const score = match?.score;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderComment}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.back}>← Retour</Text>
              </TouchableOpacity>
            </View>

            {/* Score Card */}
            <View style={styles.scoreCard}>
              <Text style={[styles.statusBadge, getStatusStyle(match?.status)]}>
                {getStatusLabel(match?.status)}
              </Text>

              <View style={styles.teamsRow}>
                <View style={styles.teamBlock}>
                  {home?.crest && (
                    <Image source={{ uri: home.crest }} style={styles.teamCrest} />
                  )}
                  <Text style={styles.teamName} numberOfLines={2}>{home?.name}</Text>
                </View>

                <View style={styles.scoreBlock}>
                  <Text style={styles.scoreMain}>
                    {score?.fullTime?.home ?? ' '} - {score?.fullTime?.away ?? ' '}
                  </Text>
                  {score?.halfTime?.home !== null && (
                    <Text style={styles.halfTime}>
                      Mi-temps : {score?.halfTime?.home} - {score?.halfTime?.away}
                    </Text>
                  )}
                </View>

                <View style={styles.teamBlock}>
                  {away?.crest && (
                    <Image source={{ uri: away.crest }} style={styles.teamCrest} />
                  )}
                  <Text style={styles.teamName} numberOfLines={2}>
                    {away?.name}
                  </Text>
                </View>
              </View>

              {/* Infos match */}
              {match?.venue && (
                <Text style={styles.matchInfo}>📍 {match.venue}</Text>
              )}
              {match?.utcDate && (
                <Text style={styles.matchInfo}>
                  {new Date(match.utcDate).toLocaleDateString('fr-FR', {
                    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
                  })}
                </Text>
              )}

              {/* Favoris */}
              <View style={styles.favRow}>
                <TouchableOpacity
                  style={styles.favBtn}
                  onPress={() => toggleFavorite(home, true)}
                >
                  <Text style={styles.favText}>
                    {favoriteHome ? '★' : '☆'} {home?.shortName || home?.name}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.favBtn}
                  onPress={() => toggleFavorite(away, false)}
                >
                  <Text style={styles.favText}>
                    {favoriteAway ? '★' : '☆'} {away?.shortName || away?.name}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Titre commentaires */}
            <Text style={styles.commentsTitle}>Commentaires ({comments.filter(c => !c.parentId).length})</Text>
          </>
        }
      />

      {/* Zone de saisie */}
      <View style={styles.inputArea}>
        {replyTo && (
          <View style={styles.replyBanner}>
            <Text style={styles.replyBannerText}>
              Répondre à {replyTo.user?.username}
            </Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={styles.replyCancel}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor="#666"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={sendComment}
            disabled={sending}
          >
            {sending
              ? <ActivityIndicator color={colors.background} size="small" />
              : <Text style={styles.sendText}>→</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  back: {
    color: colors.accent,
    ...typography.data,
  },
  scoreCard: {
    backgroundColor: colors.surface2,
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  statusBadge: {
    ...typography.label,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  teamBlock: {
    flex: 1,
    alignItems: 'center',
  },
  teamCrest: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  teamName: {
    ...typography.data,
    color: colors.text,
    textAlign: 'center',
  },
  scoreBlock: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  scoreMain: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  halfTime: {
    ...typography.label,
    color: '#888',
    marginTop: 4,
  },
  matchInfo: {
    ...typography.label,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
  },
  favRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  favBtn: {
    padding: 8,
  },
  favText: {
    color: colors.accent,
    ...typography.label,
  },
  commentsTitle: {
    ...typography.h3,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  commentCard: {
    backgroundColor: colors.surface2,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  replyCard: {
    backgroundColor: colors.surface1,
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginLeft: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  commentUser: {
    ...typography.data,
    color: colors.text,
    fontWeight: '600',
  },
  commentDate: {
    ...typography.label,
    color: '#888',
  },
  commentContent: {
    ...typography.body,
    color: colors.text,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },
  actionText: {
    ...typography.label,
    color: '#888',
  },
  inputArea: {
    bottom: 40,
    borderTopWidth: 1,
    borderTopColor: colors.surface2,
    padding: 12,
    backgroundColor: colors.surface1,
  },
  replyBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface2,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  replyBannerText: {
    ...typography.label,
    color: colors.accent,
  },
  replyCancel: {
    color: '#888',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface2,
    color: colors.text,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  sendText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: '700',
  },
  editBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  editBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
  },
  editBtnValidate: {
    backgroundColor: colors.accent,
  },
  editBtnCancel: {
    backgroundColor: '#e0e0e0',
  },
  editBtnText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 15,
  },
});