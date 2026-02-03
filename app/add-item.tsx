import { CategoryOptions } from '@/src/constants/Categories';
import { Colors } from '@/src/constants/Colors';
import { analyzeClothingImage } from '@/src/services/googleVision';
import { useClothingStore } from '@/src/store/useClothingStore';
import { ClothingItem } from '@/src/types/ClothingItem';
import { getTodayISO } from '@/src/utils/dateHelpers';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function AddItemScreen() {
  const router = useRouter();
  const { addItem } = useClothingStore();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<ClothingItem>>({
    name: '',
    category: 'tops',
    brand: '',
    size: '',
    colors: [],
    material: '',
    purchasePrice: 0,
    purchaseDate: getTodayISO(),
    careInstructions: '',
    tags: [],
  });

  const processImage = async (uri: string) => {
    setImageUri(uri);
    
    // Auto-analyze image if API key is available
    if (process.env.EXPO_PUBLIC_GOOGLE_VISION_KEY) {
      setAnalyzing(true);
      try {
        const analysis = await analyzeClothingImage(uri);
        if (analysis.category) {
          setFormData(prev => ({ ...prev, category: analysis.category as any }));
        }
        if (analysis.colors && analysis.colors.length > 0) {
          setFormData(prev => ({ ...prev, colors: analysis.colors || [] }));
        }
        if (analysis.brand) {
          setFormData(prev => ({ ...prev, brand: analysis.brand }));
        }
      } catch (error) {
        console.log('Image analysis failed:', error);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleSave = async () => {
    if (!formData.name || !imageUri) {
      Alert.alert('Error', 'Please fill in name and add a photo');
      return;
    }

    try {
      setLoading(true);
      const newItem: ClothingItem = {
        id: `item-${Date.now()}`,
        name: formData.name!,
        category: formData.category || 'tops',
        brand: formData.brand,
        size: formData.size,
        colors: formData.colors || [],
        material: formData.material,
        purchasePrice: formData.purchasePrice || 0,
        purchaseDate: formData.purchaseDate || getTodayISO(),
        photoUri: imageUri,
        careInstructions: formData.careInstructions,
        tags: formData.tags || [],
        createdAt: getTodayISO(),
        updatedAt: getTodayISO(),
      };

      await addItem(newItem);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add Item</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Colors.accent} />
          ) : (
            <Text style={styles.saveButton}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
            <Text style={styles.imagePlaceholderSubtext}>Take a photo or choose from gallery</Text>
          </View>
        )}
        {analyzing && (
          <View style={styles.analyzingOverlay}>
            <ActivityIndicator color={Colors.cardBackground} />
            <Text style={styles.analyzingText}>Analyzing...</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g., Blue Jeans"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {CategoryOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.categoryButton,
                  formData.category === option.value && styles.categoryButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, category: option.value as any })}
              >
                <Text
                  style={[
                    styles.categoryText,
                    formData.category === option.value && styles.categoryTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            value={formData.brand}
            onChangeText={(text) => setFormData({ ...formData, brand: text })}
            placeholder="e.g., Nike"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Purchase Price</Text>
          <TextInput
            style={styles.input}
            value={formData.purchasePrice?.toString() || ''}
            onChangeText={(text) =>
              setFormData({ ...formData, purchasePrice: parseFloat(text) || 0 })
            }
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: Colors.cardBackground,
  },
  cancelButton: {
    fontSize: 16,
    color: Colors.text,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  saveButton: {
    fontSize: 16,
    color: Colors.accent,
    fontWeight: '600',
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: Colors.text,
    opacity: 0.6,
    fontWeight: '600',
    marginBottom: 4,
  },
  imagePlaceholderSubtext: {
    fontSize: 12,
    color: Colors.text,
    opacity: 0.4,
  },
  analyzingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analyzingText: {
    color: Colors.cardBackground,
    marginTop: 8,
    fontSize: 14,
  },
  form: {
    paddingHorizontal: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.text,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryTextActive: {
    color: Colors.cardBackground,
    fontWeight: '600',
  },
});
