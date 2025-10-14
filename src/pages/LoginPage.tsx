import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Por favor, insira seu e-mail');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email.toLowerCase().trim());
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'E-mail não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@clinicamodelo.com.br', name: 'Clínica Modelo' },
    { email: 'admin@saudetotal.com.br', name: 'Clínica Saúde Total' },
    { email: 'admin@vidaetrabalho.com.br', name: 'Clínica Vida & Trabalho' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Clube de Vantagens</h1>
          <p className="mt-2 text-gray-600">Portal da Clínica</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail da Clínica</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@suaclinica.com.br"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Acessar Painel
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Contas de Demonstração</span>
              </div>
            </div>

            <div className="space-y-2">
              {demoAccounts.map(({ email: demoEmail, name }) => (
                <button
                  key={demoEmail}
                  type="button"
                  onClick={() => setEmail(demoEmail)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  <p className="font-medium text-gray-900 text-sm">{name}</p>
                  <p className="text-xs text-gray-500">{demoEmail}</p>
                </button>
              ))}
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">© 2025 Clube de Vantagens</p>
      </div>
    </div>
  );
}
