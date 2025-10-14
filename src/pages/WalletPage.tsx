import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Clock, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ClinicBalance, FinancialTransaction } from '@/types/database';

export default function WalletPage() {
  const { clinic } = useAuth();
  const [balance, setBalance] = useState<ClinicBalance | null>(null);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinic) loadFinancialData();
  }, [clinic]);

  const loadFinancialData = async () => {
    if (!clinic) return;
    setLoading(true);
    try {
      const { data: balanceData } = await supabase.from('clinic_balance').select('*').eq('clinic_id', clinic.id).maybeSingle();
      if (balanceData) setBalance(balanceData);

      const { data: txData } = await supabase.from('financial_transactions').select('*').eq('clinic_id', clinic.id).order('created_at', { ascending: false }).limit(20);
      if (txData) setTransactions(txData);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `R$ ${(value / 100).toFixed(2).replace('.', ',')}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Carteira</h1>
      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
      ) : (
        <>
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white mb-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-2">Saldo Disponível</p>
                <p className="text-4xl font-bold">{balance ? formatCurrency(balance.available_balance) : 'R$ 0,00'}</p>
              </div>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50">Sacar</button>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Pendente: {balance ? formatCurrency(balance.pending_balance) : 'R$ 0,00'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Recebido</p>
              <p className="text-2xl font-bold">{balance ? formatCurrency(balance.total_earned) : 'R$ 0,00'}</p>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Sacado</p>
              <p className="text-2xl font-bold">{balance ? formatCurrency(balance.total_withdrawn) : 'R$ 0,00'}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xl font-bold mb-6">Transações</h2>
            {transactions.length === 0 ? (
              <div className="text-center py-12"><Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">Nenhuma transação</p></div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {tx.type === 'credit' ? <ArrowDownRight className="w-5 h-5 text-green-600" /> : <ArrowUpRight className="w-5 h-5 text-red-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(tx.created_at)}</p>
                      </div>
                    </div>
                    <p className={`text-lg font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount < 0 ? '' : '+'}{formatCurrency(Math.abs(tx.amount))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
