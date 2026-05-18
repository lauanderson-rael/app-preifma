import { Colors } from '@/constants/Colors';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface QuestionImageProps {
  uri: string;
  style?: any;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

export function QuestionImage({ uri, style, resizeMode = 'contain' }: QuestionImageProps) {
  const [loading, setLoading] = useState(true);
  const [zoomVisible, setZoomVisible] = useState(false);

  return (
    <>
      <Pressable style={styles.container} onPress={() => setZoomVisible(true)}>
        <Image
          source={{ uri }}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <View style={styles.skeletonContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.skeletonText}>Carregando imagem...</Text>
          </View>
        )}
        <View style={styles.zoomHint}>
          <Text style={styles.zoomHintText}>Toque para ampliar</Text>
        </View>
      </Pressable>

      <Modal visible={zoomVisible} transparent animationType="fade" onRequestClose={() => setZoomVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setZoomVisible(false)}>
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Image source={{ uri }} style={styles.zoomImage} resizeMode="contain" />
            <Pressable style={styles.closeButton} onPress={() => setZoomVisible(false)}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#ffffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skeletonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  skeletonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  zoomHint: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  zoomHintText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 900,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 12,
  },
  zoomImage: {
    width: '100%',
    height: 420,
    backgroundColor: '#FFFFFF',
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
