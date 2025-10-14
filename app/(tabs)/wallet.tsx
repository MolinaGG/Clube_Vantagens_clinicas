import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ClinicBalance, FinancialTransaction } from '@/types/database';

export default function WalletScreen() {
  const { clinic } = useAuth();
  const [balance, setBalance] = useState<ClinicBalance | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    if (clinic) {
      loadFinancialData();
    }
  }, [clinic, selectedPeriod]);

  const loadFinancialData = async () => {
    if (!clinic) return;

    setLoading(true);
    try {
      const { data: balanceData } = await supabase
        .from('clinic_balance')
        .select('*')
        .eq('clinic_id', clinic.id)
        .maybeSingle();

      if (balanceData) {
        setBalance(balanceData);
      }

      let dateFilter = new Date();
      if (selectedPeriod === 'week') {
        dateFilter.setDate(dateFilter.getDate() - 7);
      } else if (selectedPeriod === 'month') {
        dateFilter.setMonth(dateFilter.getMonth() - 1);
      } else {
        dateFilter.setFullYear(dateFilter.getFullYear() - 10);
      }

      const { data: transactionsData } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('clinic_id', clinic.id)
        .gte('created_at', dateFilter.toISOString())
        .order('created_at', { ascending: false });

      if (transactionsData) {
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `R$ ${(value / 100).toFixed(2).replace('.', ',')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownRight size={20} color="#10b981" strokeWidth={2} />;
      case 'fee':
      case 'withdrawal':
        return <ArrowUpRight size={20} color="#ef4444" strokeWidth={2} />;
      default:
        return <DollarSign size={20} color="#6b7280" strokeWidth={2} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'credit':
        return '#10b981';
      case 'fee':
      case 'withdrawal':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Carteira</Text>
          <Text style={styles.subtitle}>Acompanhe seus ganhos</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <>
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Saldo Disponível</Text>
                <TouchableOpacity style={styles.withdrawButton}>
                  <Download size={18} color="#2563eb" strokeWidth={2} />
                  <Text style={styles.withdrawButtonText}>Sacar</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.balanceAmount}>
                {balance ? formatCurrency(balance.available_balance) : 'R$ 0,00'}
              </Text>
              <View style={styles.balanceDetails}>
                <View style={styles.balanceDetailItem}>
                  <Clock size={16} color="#f59e0b" strokeWidth={2} />
                  <Text style={styles.balanceDetailLabel}>Pendente</Text>
                  <Text style={styles.balanceDetailValue}>
                    {balance ? formatCurrency(balance.pending_balance) : 'R$ 0,00'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#d1fae5' }]}>
                  <TrendingUp size={24} color="#10b981" strokeWidth={2} />
                </View>
                <Text style={styles.statLabel}>Total Recebido</Text>
                <Text style={styles.statValue}>
                  {balance ? formatCurrency(balance.total_earned) : 'R$ 0,00'}
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
                  <DollarSign size={24} color="#2563eb" strokeWidth={2} />
                </View>
                <Text style={styles.statLabel}>Total Sacado</Text>
                <Text style={styles.statValue}>
                  {balance ? formatCurrency(balance.total_withdrawn) : 'R$ 0,00'}
                </Text>
              </View>
            </View>

            <View style={styles.transactionsSection}>
              <View style={styles.transactionsHeader}>
                <Text style={styles.transactionsTitle}>Transações</Text>
                <View style={styles.periodFilter}>
                  <TouchableOpacity
                    style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
                    onPress={() => setSelectedPeriod('week')}
                  >
                    <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
                      7d
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
                    onPress={() => setSelectedPeriod('month')}
                  >
                    <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
                      30d
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.periodButton, selectedPeriod === 'all' && styles.periodButtonActive]}
                    onPress={() => setSelectedPeriod('all')}
                  >
                    <Text style={[styles.periodButtonText, selectedPeriod === 'all' && styles.periodButtonTextActive]}>
                      Tudo
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {transactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Calendar size={48} color="#d1d5db" strokeWidth={2} />
                  <Text style={styles.emptyStateTitle}>Nenhuma transação</Text>
                  <Text style={styles.emptyStateText}>
                    As transações aparecerão aqui conforme você receber pagamentos
                  </Text>
                </View>
              ) : (
                <View style={styles.transactionsList}>
                  {transactions.map(transaction => (
                    <View key={transaction.id} style={styles.transactionCard}>
                      <View style={styles.transactionIcon}>
                        {getTransactionIcon(transaction.type)}
                      </View>

                      <View style={styles.transactionContent}>
                        <Text style={styles.transactionDescription}>
                          {transaction.description}
                        </Text>
                        <View style={styles.transactionMeta}>
                          <Text style={styles.transactionDate}>
                            {formatDate(transaction.created_at)}
                          </Text>
                          <Text style={styles.transactionTime}>
                            {formatTime(transaction.created_at)}
                          </Text>
                          {transaction.status === 'pending' && (
                            <View style={styles.pendingBadge}>
                              <Text style={styles.pendingBadgeText}>Pendente</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <Text
                        style={[
                          styles.transactionAmount,
                          { color: getTransactionColor(transaction.type) }
                        ]}
                      >
                        {transaction.amount < 0 ? '' : '+'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
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
    paddingTop: 16,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: '#2563eb',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#dbeafe',
    fontWeight: '600',
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  withdrawButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  balanceDetails: {
    gap: 8,
  },
  balanceDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceDetailLabel: {
    fontSize: 14,
    color: '#dbeafe',
  },
  balanceDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 'auto',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  transactionsSection: {
    marginBottom: 24,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  periodFilter: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#ffffff',
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  periodButtonTextActive: {
    color: '#2563eb',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 280,
  },
  transactionsList: {
    gap: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionDate: {
    fontSize: 13,
    color: '#6b7280',
  },
  transactionTime: {
    fontSize: 13,
    color: '#9ca3af',
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});
