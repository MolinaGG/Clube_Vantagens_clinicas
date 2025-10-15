import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, MapPin, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ClinicAd } from '@/types/database';
import { getAdsByClinic } from '@/lib/mockData';

export default function AdsPage() {
  const { clinic } = useAuth();
  const [ads, setAds] = useState<ClinicAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinic) loadAds();
  }, [clinic]);

  const loadAds = async () => {
    if (!clinic) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const data = getAdsByClinic(clinic.id);
    setAds(data);
    setLoading(false);
  };

  const toggleAdStatus = (adId: string, currentStatus: boolean) => {
    setAds(ads.map(ad => ad.id === adId ? { ...ad, active: !currentStatus } : ad));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Anúncios</h1>
          <p className="text-gray-600 mt-1">Gerencie suas ofertas</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="w-5 h-5" />
          Novo Anúncio
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>
      ) : ads.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum anúncio criado</h3>
          <p className="text-gray-500 mb-6">Crie anúncios para promover seus serviços</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Criar Primeiro Anúncio</button>
        </div>
      ) : (
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="bg-white rounded-xl border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">{ad.category}</span>
                  {ad.active ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Eye className="w-3 h-3" />Ativo
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />Inativo
                    </span>
                  )}
                </div>
                <button onClick={() => toggleAdStatus(ad.id, ad.active)} className="text-sm text-blue-600 hover:text-blue-700">
                  {ad.active ? 'Desativar' : 'Ativar'}
                </button>
              </div>
              <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
              <p className="text-gray-600 mb-4">{ad.description}</p>
              {ad.price_range && (
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">{ad.price_range}</span>
                </div>
              )}
              {clinic && (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{clinic.address?.city}, {clinic.address?.state}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
