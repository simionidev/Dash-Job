import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import api from '../../services/api';

interface Props {
  route?: { params?: { eventId: string } };
}

export default function ManualSearchScreen({ route }: Props) {
  const eventId = route?.params?.eventId || '';
  const [query, setQuery] = useState('');
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState<Record<string, boolean>>({});

  async function search() {
    if (query.length < 2) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/guests/event/${eventId}?search=${query}`);
      setGuests(data);
    } catch { Alert.alert('Erro', 'Falha na busca'); }
    finally { setLoading(false); }
  }

  async function searchByCpf() {
    if (query.length < 11) return;
    setLoading(true);
    try {
      const cpf = query.replace(/\D/g, '');
      const { data } = await api.get(`/guests/event/${eventId}/cpf/${cpf}`);
      setGuests(data ? [data] : []);
    } catch { setGuests([]); }
    finally { setLoading(false); }
  }

  async function doCheckIn(guestId: string) {
    try {
      await api.post(`/checkin/manual/${guestId}`, { eventId });
      setCheckedIn((prev) => ({ ...prev, [guestId]: true }));
      Alert.alert('Sucesso', 'Check-in realizado!');
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.message || 'Falha no check-in');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Busca Manual</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Nome ou CPF..."
          placeholderTextColor="#6b7280"
          onSubmitEditing={search}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search}>
          <Text style={styles.searchBtnText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#6366f1" style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={guests}
          keyExtractor={(g) => g.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {query ? 'Nenhum convidado encontrado' : 'Digite para buscar'}
            </Text>
          }
          renderItem={({ item: guest }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                {guest.isVip && (
                  <View style={styles.vipBadge}>
                    <Text style={styles.vipText}>VIP</Text>
                  </View>
                )}
                <Text style={styles.guestName}>{guest.name}</Text>
                <Text style={styles.guestSub}>{guest.list?.name}</Text>
                {guest.cpf && <Text style={styles.guestSub}>CPF: {guest.cpf}</Text>}
                {guest.phone && <Text style={styles.guestSub}>{guest.phone}</Text>}
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, guest.rsvp?.status === 'CONFIRMED' ? styles.dotGreen : styles.dotGray]} />
                  <Text style={styles.statusText}>
                    {guest.rsvp?.status === 'CONFIRMED' ? 'RSVP Confirmado' : 'Sem confirmação'}
                  </Text>
                </View>
              </View>

              {guest.checkIn || checkedIn[guest.id] ? (
                <View style={styles.checkedBadge}>
                  <Text style={styles.checkedText}>✓ ENTRADA</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.checkInBtn}
                  onPress={() => doCheckIn(guest.id)}
                >
                  <Text style={styles.checkInBtnText}>Check-in</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  title: { fontSize: 20, fontWeight: '700', color: '#1e293b', padding: 16, paddingBottom: 8 },
  searchRow: { flexDirection: 'row', gap: 8, padding: 16, paddingTop: 8 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15, color: '#1e293b' },
  searchBtn: { backgroundColor: '#6366f1', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  searchBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', color: '#94a3b8', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  cardInfo: { flex: 1 },
  vipBadge: { backgroundColor: '#fef3c7', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  vipText: { color: '#92400e', fontSize: 10, fontWeight: '700' },
  guestName: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
  guestSub: { fontSize: 13, color: '#64748b' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  dotGreen: { backgroundColor: '#22c55e' },
  dotGray: { backgroundColor: '#cbd5e1' },
  statusText: { fontSize: 12, color: '#64748b' },
  checkInBtn: { backgroundColor: '#6366f1', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  checkInBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  checkedBadge: { backgroundColor: '#dcfce7', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
  checkedText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },
});
