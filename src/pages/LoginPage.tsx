import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { db } from '@/lib/db';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAppStore((s) => s.setAuthenticated);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const settings = await db.settings.get('main');
      const correctPassword = settings?.password || 'haccp2026';

      if (password === correctPassword) {
        setAuthenticated(true);
        toast.success('Mirësevini në platformë!');
        navigate('/app', { replace: true });
      } else {
        setError('Fjalëkalimi është i gabuar. Provoni përsëri.');
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    } catch {
      setError('Ndodhi një gabim. Provoni përsëri.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9f1] via-white to-[#f8fafc] flex items-center justify-center p-4">
      <div className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#1a5c35] flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#0f172a]">SiguriUshqimore</h1>
          <p className="text-xs font-medium text-[#64748b] tracking-widest uppercase mt-1">HACCP Platform</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg border border-[#e2e8f0] p-6">
          <h2 className="text-lg font-semibold text-[#0f172a] mb-1">Identifikimi</h2>
          <p className="text-sm text-[#64748b] mb-6">Vendosni fjalëkalimin për të hyrë në platformë</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-[#0f172a]">Fjalëkalimi</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Vendos fjalëkalimin..."
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-[#e2e8f0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5c35] focus:border-transparent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && <p className="text-xs text-[#dc2626] mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-2.5 bg-[#1a5c35] text-white text-sm font-medium rounded-lg hover:bg-[#144a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Duke hyrë...' : 'Hyr në Platformë'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#94a3b8] mt-6">
          &copy; {new Date().getFullYear()} SiguriUshqimore HACCP. Të gjitha të drejtat e rezervuara.
        </p>
      </div>
    </div>
  );
}
