import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export default function DepositModal({ isOpen, onClose, userId, onSuccess }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'wave' | 'orange_money' | 'mtn_momo'>('wave');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ici, nous simulons un dépôt réussi
      // Dans la vraie vie, vous appelleriez l'API Flutterwave
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          amount: parseFloat(amount),
          method,
          status: 'completed'
        });

      if (!error) {
        // Mettre à jour le solde
        await supabase.rpc('add_to_balance', {
          user_id: userId,
          amount_to_add: parseFloat(amount)
        });

        alert(`Dépôt de ${amount} FCFA via ${method} effectué!`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Erreur dépôt:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-800 p-6 rounded-lg w-96">
        <h3 className="text-xl text-white font-bold mb-4">Dépôt Mobile Money</h3>
        <form onSubmit={handleDeposit} className="space-y-4">
          <div>
            <label className="text-gray-300 block mb-2">Montant (FCFA)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white"
              placeholder="1000"
              min="100"
              required
            />
          </div>
          <div>
            <label className="text-gray-300 block mb-2">Méthode</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full p-3 rounded bg-gray-700 text-white"
            >
              <option value="wave">Wave</option>
              <option value="orange_money">Orange Money</option>
              <option value="mtn_momo">MTN MoMo</option>
            </select>
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 text-white p-3 rounded hover:bg-green-700"
            >
              {loading ? 'Traitement...' : 'Déposer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-700"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
