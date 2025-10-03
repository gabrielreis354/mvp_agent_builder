'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Brain, Users, Zap, Target, ArrowRight, CheckCircle, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function WelcomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const steps = [
    {
      icon: Brain,
      title: 'Bem-vindo ao AutomateAI!',
      description: 'Sua plataforma de automação inteligente para RH está pronta.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: Target,
      title: 'Casos de Uso Personalizados',
      description: 'Baseado no seu perfil, preparamos soluções específicas para suas necessidades.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Zap,
      title: 'Comece Agora',
      description: 'Explore templates prontos ou crie seu primeiro agente personalizado.',
      color: 'from-green-500 to-emerald-600'
    }
  ];

  const features = [
    {
      icon: Users,
      title: 'Recrutamento Inteligente',
      description: 'Automatize triagem de currículos e agendamento de entrevistas',
      href: '/gallery?category=recruitment'
    },
    {
      icon: Target,
      title: 'Onboarding Personalizado',
      description: 'Crie fluxos de integração únicos para novos colaboradores',
      href: '/gallery?category=onboarding'
    },
    {
      icon: Brain,
      title: 'Analytics de Performance',
      description: 'Análise automatizada de dados de RH e relatórios inteligentes',
      href: '/gallery?category=analytics'
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">AutomateAI</h1>
          </div>
          
          {session.user && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 inline-block">
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                {(session.user as any).company && (
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    <span>{(session.user as any).company}</span>
                  </div>
                )}
                {(session.user as any).jobTitle && (
                  <div className="flex items-center">
                    <Briefcase className="w-4 h-4 mr-1" />
                    <span>{(session.user as any).jobTitle}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Main Welcome Flow */}
        <div className="max-w-4xl mx-auto">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className={`w-20 h-20 bg-gradient-to-r ${steps[currentStep].color} rounded-full flex items-center justify-center mx-auto mb-6`}
              >
                {React.createElement(steps[currentStep].icon, { className: "w-10 h-10 text-white" })}
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {steps[currentStep].title}
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {steps[currentStep].description}
              </p>

              {/* Progress Indicators */}
              <div className="flex justify-center space-x-2 mb-8">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-blue-600'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-center space-x-4">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="px-6"
                  >
                    Anterior
                  </Button>
                )}
                
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={nextStep}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
                  >
                    Continuar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <div className="space-x-4">
                    <Link href="/gallery">
                      <Button
                        variant="outline"
                        className="px-6"
                      >
                        Ver Templates
                      </Button>
                    </Link>
                    <Link href="/builder">
                      <Button
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6"
                      >
                        Criar Agente
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Features Grid - Show on last step */}
          {currentStep === steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-3 gap-6 mb-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => router.push(feature.href)}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-gray-600 mb-4">
              Precisa de ajuda? Confira nossos recursos:
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <Link href="/docs" className="text-blue-600 hover:text-blue-700 underline">
                Documentação
              </Link>
              <Link href="/support" className="text-blue-600 hover:text-blue-700 underline">
                Suporte
              </Link>
              <Link href="/examples" className="text-blue-600 hover:text-blue-700 underline">
                Exemplos
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
