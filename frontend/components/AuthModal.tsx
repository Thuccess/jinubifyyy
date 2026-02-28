import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from './icons/Icons';
import { authAPI, storeAuth } from '../services/api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  view: 'signIn' | 'signUp';
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, view: initialView, onSuccess }: AuthModalProps) => {
  const [view, setView] = useState<'signIn' | 'signUp'>(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    photoURL: '',
  });

  React.useEffect(() => {
    setView(initialView);
    setError('');
    setFormData({ name: '', email: '', password: '', photoURL: '' });
  }, [initialView, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (view === 'signUp') {
        const response = await authAPI.signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          photoURL: formData.photoURL || undefined,
        });
        
        const signupRole = response.user.role && String(response.user.role).toLowerCase() === 'admin' ? 'admin' : 'user';
        const normalizedUser = {
          _id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          photoURL: response.user.photoURL,
          role: signupRole,
          balance: response.user.balance,
        };
        storeAuth(response.token, normalizedUser as User, rememberMe);
        onSuccess(normalizedUser as User);
      } else {
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password,
        });
        
        const loginRole = response.user.role && String(response.user.role).toLowerCase() === 'admin' ? 'admin' : 'user';
        const normalizedUser = {
          _id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          photoURL: response.user.photoURL,
          role: loginRole,
          balance: response.user.balance,
        };
        storeAuth(response.token, normalizedUser as User, rememberMe);
        onSuccess(normalizedUser as User);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.[0]?.msg ||
        `Failed to ${view === 'signUp' ? 'sign up' : 'sign in'}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          {/* Keep overlay simple and avoid double-blur – the panel itself handles glassmorphism. */}
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              {/* Glassmorphism modal panel: semi-transparent, blurred card using shared utilities. */}
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden glass-surface glass-surface--modal glass-interactive p-6 text-left align-middle transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold leading-6 text-text-primary"
                  >
                    {view === 'signUp' ? 'Create Account' : 'Sign In'}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted/90 transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {view === 'signUp' && (
                    <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-4 py-2 border border-border-subtle rounded-lg shadow-sm focus:ring-brand-ring focus:border-border-accent bg-bg-primary dark:bg-bg-primary text-text-primary"
                        placeholder="Your name"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-4 py-2 border border-border-subtle rounded-lg shadow-sm focus:ring-brand-ring focus:border-border-accent bg-bg-primary dark:bg-bg-primary text-text-primary"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                      className="block w-full px-4 py-2 border border-border-subtle rounded-lg shadow-sm focus:ring-brand-ring focus:border-border-accent bg-bg-primary dark:bg-bg-primary text-text-primary"
                      placeholder="••••••••"
                    />
                  </div>

                  {view === 'signUp' && (
                    <div>
                      <label htmlFor="photoURL" className="block text-sm font-medium text-text-secondary mb-1">
                        Photo URL (Optional)
                      </label>
                      <input
                        type="url"
                        id="photoURL"
                        name="photoURL"
                        value={formData.photoURL}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2 border border-border-subtle rounded-lg shadow-sm focus:ring-brand-ring focus:border-border-accent bg-bg-primary dark:bg-bg-primary text-text-primary"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                  )}

                  {view === 'signIn' && (
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-brand-primary focus:ring-brand-ring border-border-subtle rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-text-primary">
                        Remember me
                      </label>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 bg-surface-muted border border-border-strong rounded-lg">
                      <p className="text-sm text-text-primary">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 rounded-lg shadow-sm text-sm font-medium text-text-inverted bg-brand-primary hover:bg-[color-mix(in_oklab,var(--accent-primary)_0.9,var(--bg-primary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-ring disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? 'Processing...' : view === 'signUp' ? 'Sign Up' : 'Sign In'}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      setView(view === 'signIn' ? 'signUp' : 'signIn');
                      setError('');
                    }}
                    className="text-sm text-brand-primary hover:text-text-primary hover:bg-surface-muted/90 py-1 px-2 rounded-lg transition-colors duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--accent-ring)]"
                  >
                    {view === 'signIn' 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AuthModal;

