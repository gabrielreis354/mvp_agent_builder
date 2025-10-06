'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Brain, Building2, Users, Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function SignUpForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Dados RH específicos
    company: '',
    jobTitle: '',
    department: '',
    companySize: '',
    primaryUseCase: '',
    phone: '',
    linkedIn: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const nextStep = () => {
    if (step === 1) {
      // Validar dados básicos
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Por favor, preencha todos os campos obrigatórios');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não coincidem');
        return;
      }
      if (formData.password.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres');
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // A API retorna sucesso, agora redirecionamos para o login
        // com uma mensagem para o usuário.
        router.push('/auth/signin?message=Account created successfully! Please sign in.');
      } else {
        setError(data.error || 'Erro ao criar conta');
      }
    } catch (err) {
      setError('Erro de rede. Não foi possível conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const companyOptions = [
    { value: '1-10', label: '1-10 funcionários' },
    { value: '11-50', label: '11-50 funcionários' },
    { value: '51-200', label: '51-200 funcionários' },
    { value: '201-1000', label: '201-1000 funcionários' },
    { value: '1000+', label: 'Mais de 1000 funcionários' },
  ];

  const useCaseOptions = [
    { value: 'recruitment', label: 'Recrutamento e Seleção' },
    { value: 'onboarding', label: 'Onboarding de Funcionários' },
    { value: 'performance', label: 'Avaliação de Performance' },
    { value: 'training', label: 'Treinamento e Desenvolvimento' },
    { value: 'analytics', label: 'Analytics de RH' },
    { value: 'employee_support', label: 'Suporte ao Funcionário' },
    { value: 'other', label: 'Outros' },
  ];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Professional background with project colors */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent -z-10" />
        <div className="fixed inset-0 bg-grid-white/[0.02] -z-10" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-8 h-8 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Conta Criada!</h2>
              <p className="text-gray-300 mb-4">
                Bem-vindo ao SimplifiqueIA RH! Redirecionando para o login...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Professional background with project colors */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent -z-10" />
      <div className="fixed inset-0 bg-grid-white/[0.02] -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <Brain className="h-10 w-10 text-blue-400 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SimplifiqueIA
            </h1>
          </Link>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600/80 to-indigo-600/80 backdrop-blur-sm p-6 text-white border-b border-white/20">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">
                {step === 1 ? 'Criar Conta' : 'Dados Profissionais'}
              </h2>
              <p className="text-blue-100 text-sm">
                {step === 1 
                  ? 'Comece sua jornada de automação em RH'
                  : 'Personalize sua experiência'
                }
              </p>
            
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-blue-200 mb-2">
                  <span>Dados Básicos</span>
                  <span>Dados RH</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <motion.div
                    className="bg-white rounded-full h-2"
                    initial={{ width: '50%' }}
                    animate={{ width: step === 1 ? '50%' : '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="space-y-4">
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white font-medium">Nome Completo *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">Email Corporativo *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                      placeholder="seu.email@empresa.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">Senha *</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white font-medium">Confirmar Senha *</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                      placeholder="Digite a senha novamente"
                      required
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-white font-medium flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        Empresa *
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                        placeholder="Nome da empresa"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobTitle" className="text-white font-medium flex items-center">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Cargo *
                      </Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        value={formData.jobTitle}
                        onChange={handleChange}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                        placeholder="Seu cargo atual"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-white font-medium">Departamento</Label>
                    <Input
                      id="department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                      placeholder="Ex: Recursos Humanos, Talent Acquisition"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-white font-medium flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Tamanho da Empresa *
                    </Label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:border-blue-400 focus:ring-blue-400/50 bg-white/10 text-white backdrop-blur-sm"
                      required
                    >
                      <option value="" className="bg-gray-800 text-white">Selecione o tamanho</option>
                      {companyOptions.map(option => (
                        <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primaryUseCase" className="text-white font-medium">Principal Caso de Uso *</Label>
                    <select
                      id="primaryUseCase"
                      name="primaryUseCase"
                      value={formData.primaryUseCase}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-white/30 rounded-md focus:border-blue-400 focus:ring-blue-400/50 bg-white/10 text-white backdrop-blur-sm"
                      required
                    >
                      <option value="" className="bg-gray-800 text-white">Como pretende usar o SimplifiqueIA RH?</option>
                      {useCaseOptions.map(option => (
                        <option key={option.value} value={option.value} className="bg-gray-800 text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white font-medium">Telefone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                        placeholder="(11) 99999-9999"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedIn" className="text-white font-medium">LinkedIn</Label>
                      <Input
                        id="linkedIn"
                        name="linkedIn"
                        type="url"
                        value={formData.linkedIn}
                        onChange={handleChange}
                        className="bg-white/10 border-white/30 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/50 backdrop-blur-sm"
                        placeholder="linkedin.com/in/seu-perfil"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between pt-4">
                {step === 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center"
                  >
                    Voltar
                  </Button>
                )}
                
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all ${step === 1 ? 'ml-auto' : ''}`}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {step === 1 ? (
                    <>
                      Continuar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    'Criar Conta'
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-300">
              Já tem uma conta?{' '}
              <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Fazer login
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link href="/" className="text-gray-300 hover:text-white text-sm flex items-center justify-center transition-colors">
                ← Voltar para o início
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
