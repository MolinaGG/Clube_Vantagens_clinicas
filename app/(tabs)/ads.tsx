import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Edit2, Trash2, Eye, EyeOff, MapPin, DollarSign } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ClinicAd } from '@/types/database';

export default function AdsScreen() {
  const { clinic } = useAuth();
  const [ads, setAds] = useState<ClinicAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinic) {
      loadAds();
    }
  }, [clinic]);

  const loadAds = async () => {
    if (!clinic) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clinic_ads')
        .select('*')
        .eq('clinic_id', clinic.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdStatus = async (adId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('clinic_ads')
        .update({ active: !currentStatus })
        .eq('id', adId);

      setAds(ads.map(ad =>
        ad.id === adId ? { ...ad, active: !currentStatus } : ad
      ));
    } catch (error) {
      console.error('Error toggling ad:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      package: 'Pacote',
      promotion: 'Promoção',
      corporate: 'Empresarial',
      service: 'Serviço',
    };
    return labels[category] || category;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Anúncios</Text>
          <Text style={styles.subtitle}>Gerencie suas ofertas</Text>
        </View>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={20} color="#ffffff" strokeWidth={2} />
          <Text style={styles.addButtonText}>Novo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : ads.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <DollarSign size={48} color="#d1d5db" strokeWidth={2} />
            </View>
            <Text style={styles.emptyTitle}>Nenhum anúncio criado</Text>
            <Text style={styles.emptyText}>
              Crie anúncios para promover seus serviços e atrair mais clientes
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Plus size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.emptyButtonText}>Criar Primeiro Anúncio</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.adsList}>
            {ads.map(ad => (
              <View key={ad.id} style={styles.adCard}>
                <View style={styles.adHeader}>
                  <View style={styles.adBadges}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{getCategoryLabel(ad.category)}</Text>
                    </View>
                    {ad.active ? (
                      <View style={styles.activeBadge}>
                        <Eye size={12} color="#10b981" strokeWidth={2} />
                        <Text style={styles.activeBadgeText}>Ativo</Text>
                      </View>
                    ) : (
                      <View style={styles.inactiveBadge}>
                        <EyeOff size={12} color="#6b7280" strokeWidth={2} />
                        <Text style={styles.inactiveBadgeText}>Inativo</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.adBody}>
                  <Text style={styles.adTitle}>{ad.title}</Text>
                  <Text style={styles.adDescription} numberOfLines={3}>
                    {ad.description}
                  </Text>

                  {ad.price_range && (
                    <View style={styles.priceSection}>
                      <DollarSign size={16} color="#10b981" strokeWidth={2} />
                      <Text style={styles.priceText}>{ad.price_range}</Text>
                    </View>
                  )}

                  {clinic && (
                    <View style={styles.locationSection}>
                      <MapPin size={14} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.locationText}>
                        {clinic.address?.city ? `${clinic.address.city}, ${clinic.address.state}` : 'Localização não definida'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.adFooter}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Edit2 size={16} color="#2563eb" strokeWidth={2} />
                    <Text style={styles.actionButtonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => toggleAdStatus(ad.id, ad.active)}
                  >
                    {ad.active ? (
                      <>
                        <EyeOff size={16} color="#f59e0b" strokeWidth={2} />
                        <Text style={styles.actionButtonText}>Desativar</Text>
                      </>
                    ) : (
                      <>
                        <Eye size={16} color="#10b981" strokeWidth={2} />
                        <Text style={styles.actionButtonText}>Ativar</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteButton}>
                    <Trash2 size={16} color="#ef4444" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Dicas para Anúncios Eficazes</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Use títulos claros e objetivos</Text>
            <Text style={styles.infoItem}>• Destaque os benefícios principais</Text>
            <Text style={styles.infoItem}>• Inclua faixa de preço para atrair o público certo</Text>
            <Text style={styles.infoItem}>• Adicione imagens de qualidade dos seus espaços</Text>
            <Text style={styles.infoItem}>• Mantenha as informações sempre atualizadas</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    backgroundColor: '#f3f4f6',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  adsList: {
    gap: 16,
    marginBottom: 24,
  },
  adCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  adHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  adBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  inactiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  inactiveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  adBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10b981',
  },
  locationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#6b7280',
  },
  adFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});
