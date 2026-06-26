import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Vibration, SafeAreaView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../../services/api';
import { useOfflineStore } from '../../store/offline.store';
import * as Network from 'expo-network';

interface Props {
  route?: { params?: { eventId: string } };
  navigation?: any;
}

export default function QRScanScreen({ route, navigation }: Props) {
  const eventId = route?.params?.eventId || '';
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [lastResult, setLastResult] = useState<any>(null);
  const { isOnline, queueCheckIn } = useOfflineStore();
  const cooldownRef = useRef(false);

  useEffect(() => {
    checkNetwork();
  }, []);

  async function checkNetwork() {
    const state = await Network.getNetworkStateAsync();
    useOfflineStore.getState().setOnline(!!state.isConnected);
  }

  async function handleBarCode({ data }: { data: string }) {
    if (cooldownRef.current || !scanning) return;
    cooldownRef.current = true;
    setScanning(false);

    try {
      if (isOnline) {
        const res = await api.post('/checkin/qrcode', { token: data, eventId });
        const result = res.data;

        if (result.guest) {
          Vibration.vibrate([0, 100, 100, 100]);
          setLastResult({ success: true, name: result.guest.name, list: result.guest.list?.name });
        }
      } else {
        const payload = JSON.parse(data);
        if (payload.token && payload.guestId) {
          await queueCheckIn({
            id: `${payload.guestId}-${Date.now()}`,
            guestId: payload.guestId,
            eventId: eventId || payload.eventId,
            method: 'QR_CODE',
            checkedInAt: new Date().toISOString(),
          });
          Vibration.vibrate(200);
          setLastResult({ success: true, name: payload.name, offline: true });
        }
      }
    } catch (err: any) {
      Vibration.vibrate([0, 500]);
      setLastResult({
        success: false,
        message: err.response?.data?.message || 'QR Code inválido',
      });
    }

    setTimeout(() => {
      setScanning(true);
      setLastResult(null);
      cooldownRef.current = false;
    }, 2500);
  }

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.permText}>Câmera necessária para leitura de QR Code</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leitura de QR Code</Text>
        {!isOnline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>MODO OFFLINE</Text>
          </View>
        )}
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanning ? handleBarCode : undefined}
        />

        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </View>
        </View>

        {lastResult && (
          <View style={[styles.result, lastResult.success ? styles.resultSuccess : styles.resultError]}>
            <Text style={styles.resultIcon}>{lastResult.success ? '✓' : '✗'}</Text>
            <Text style={styles.resultName}>{lastResult.success ? lastResult.name : 'Acesso negado'}</Text>
            {lastResult.list && <Text style={styles.resultList}>{lastResult.list}</Text>}
            {lastResult.offline && <Text style={styles.resultList}>Salvo offline</Text>}
            {lastResult.message && <Text style={styles.resultMsg}>{lastResult.message}</Text>}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.manualBtn}
          onPress={() => navigation?.navigate('ManualSearch', { eventId })}
        >
          <Text style={styles.manualBtnText}>Busca Manual</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: { padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 18, fontWeight: '600' },
  offlineBadge: { backgroundColor: '#f59e0b', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  offlineText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cameraContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  scanArea: { width: 260, height: 260, position: 'relative' },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: '#6366f1', borderWidth: 3 },
  tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  result: { position: 'absolute', bottom: 20, left: 16, right: 16, borderRadius: 12, padding: 16, alignItems: 'center' },
  resultSuccess: { backgroundColor: '#065f46' },
  resultError: { backgroundColor: '#7f1d1d' },
  resultIcon: { fontSize: 32, color: '#fff', marginBottom: 4 },
  resultName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultList: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  resultMsg: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  footer: { padding: 16 },
  manualBtn: { backgroundColor: 'rgba(99,102,241,0.2)', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#6366f1' },
  manualBtnText: { color: '#a5b4fc', fontSize: 15, fontWeight: '600' },
  permText: { color: '#fff', textAlign: 'center', margin: 24 },
  btn: { backgroundColor: '#6366f1', margin: 24, padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
