import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { colors, typography } from '../constants/theme';

export default function ProfileScreen() {
  const { user, setUser, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setError('');
    setSuccess('');

    if (newPassword && newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères');
      return;
    }

    setLoading(true);
    try {
      const payload = { username };
      if (newPassword) payload.password = newPassword;

      const res = await client.put('/profile', payload);
      setUser(res.data);
      setSuccess('Profil mis à jour avec succès');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setError(e.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action est irréversible. Toutes tes données seront supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.delete('/profile');
              await logout();
            } catch (e) {
              setError('Erreur lors de la suppression du compte');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.pageTitle}>Mon profil</Text>
        <Text style={styles.subtitle}>Gérez vos informations</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nom d'utilisateur</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#666"
          />

          <Text style={styles.label}>Nouveau mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Laisser vide pour ne pas changer"
            placeholderTextColor="#666"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmer le mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={colors.background} />
              : <Text style={styles.buttonText}>Mettre à jour</Text>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Zone dangereuse</Text>
          <Text style={styles.dangerSubtitle}>
            La suppression de votre compte est irréversible.
          </Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Text style={styles.deleteBtnText}>Supprimer mon compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    padding: 24,
    paddingTop: 56,
  },
  pageTitle: {
    ...typography.h2,
    color: colors.accent,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.data,
    color: '#888',
    marginBottom: 24,
  },
  card: {
    backgroundColor: colors.surface2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    ...typography.label,
    color: '#888',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surface1,
    color: colors.text,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
  },
  error: {
    color: colors.live,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  success: {
    color: colors.success,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  logoutBtn: {
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 16,
  },
  dangerZone: {
    borderWidth: 1,
    borderColor: colors.live,
    borderRadius: 12,
    padding: 16,
  },
  dangerTitle: {
    ...typography.h3,
    color: colors.live,
    marginBottom: 4,
  },
  dangerSubtitle: {
    ...typography.data,
    color: '#888',
    marginBottom: 16,
  },
  deleteBtn: {
    backgroundColor: colors.live,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});