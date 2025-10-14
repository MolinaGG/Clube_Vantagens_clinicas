import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Building2,
  Users,
  CreditCard,
  Bell,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const { clinic, signOut } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoConfirm, setAutoConfirm] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  const settingsOptions: Array<{
    category: string;
    items: Array<{
      icon: any;
      label: string;
      description: string;
      onPress?: () => void;
      rightComponent?: React.ReactElement;
    }>;
  }> = [
    {
      category: 'Clínica',
      items: [
        {
          icon: Building2,
          label: 'Dados da Clínica',
          description: 'Nome, CNPJ, endereço e contato',
          onPress: () => {},
        },
        {
          icon: Users,
          label: 'Equipe',
          description: 'Gerenciar usuários e permissões',
          onPress: () => {},
        },
      ],
    },
    {
      category: 'Operações',
      items: [
        {
          icon: FileText,
          label: 'Serviços',
          description: 'Gerenciar catálogo de serviços',
          onPress: () => {},
        },
        {
          icon: CreditCard,
          label: 'Pagamentos',
          description: 'Configurações de repasse e tarifas',
          onPress: () => {},
        },
      ],
    },
    {
      category: 'Preferências',
      items: [
        {
          icon: Bell,
          label: 'Notificações',
          description: notificationsEnabled ? 'Ativadas' : 'Desativadas',
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={notificationsEnabled ? '#2563eb' : '#f3f4f6'}
            />
          ),
        },
        {
          icon: Shield,
          label: 'Confirmação Automática',
          description: autoConfirm ? 'Ativada' : 'Desativada',
          rightComponent: (
            <Switch
              value={autoConfirm}
              onValueChange={setAutoConfirm}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={autoConfirm ? '#2563eb' : '#f3f4f6'}
            />
          ),
        },
      ],
    },
    {
      category: 'Suporte',
      items: [
        {
          icon: HelpCircle,
          label: 'Central de Ajuda',
          description: 'Tutoriais e perguntas frequentes',
          onPress: () => {},
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Gerencie sua clínica</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitials}>
              {clinic?.name?.substring(0, 2).toUpperCase() || 'CL'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{clinic?.name || 'Carregando...'}</Text>
            <Text style={styles.profileEmail}>{clinic?.email || ''}</Text>
            <Text style={styles.profilePlan}>Plano: Profissional</Text>
          </View>
        </View>

        {settingsOptions.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.category}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const isLast = itemIndex === section.items.length - 1;

                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[styles.settingItem, isLast && styles.settingItemLast]}
                    onPress={item.onPress}
                  >
                    <View style={styles.settingIcon}>
                      <Icon size={20} color="#6b7280" strokeWidth={2} />
                    </View>

                    <View style={styles.settingContent}>
                      <Text style={styles.settingLabel}>{item.label}</Text>
                      <Text style={styles.settingDescription}>{item.description}</Text>
                    </View>

                    {item.rightComponent ? (
                      item.rightComponent
                    ) : (
                      <ChevronRight size={20} color="#d1d5db" strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" strokeWidth={2} />
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Versão 1.0.0</Text>
          <Text style={styles.footerText}>© 2025 Clube de Vantagens</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 16,
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  profilePlan: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
