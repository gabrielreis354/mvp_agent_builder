'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, CheckCircle2, ArrowLeft, Mail, Star } from 'lucide-react'
import Link from 'next/link'
import { BRANDING } from '@/config/branding'

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'suggestion',
    rating: 5,
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const feedbackTypes = [
    { value: 'suggestion', label: 'Sugestão', icon: '💡' },
    { value: 'bug', label: 'Reportar Bug', icon: '🐛' },
    { value: 'compliment', label: 'Elogio', icon: '👏' },
    { value: 'question', label: 'Dúvida', icon: '❓' },
    { value: 'other', label: 'Outro', icon: '💬' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Enviar para API de feedback
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar feedback')
      }

      console.log('✅ Feedback enviado com sucesso:', data)
      setIsSubmitted(true)
    } catch (error) {
      console.error('❌ Erro ao enviar feedback:', error)
      alert('Erro ao enviar feedback. Por favor, tente novamente ou envie um email diretamente para suporte@simplifiqueia.com.br')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4">Feedback Enviado!</h2>
          <p className="text-gray-300 mb-6">
            Muito obrigado pelo seu feedback! Nossa equipe irá analisá-lo em breve.
          </p>
          
          <div className="space-y-3">
            <Link href="/">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300">
                Voltar para Home
              </button>
            </Link>
            
            <button
              onClick={() => {
                setIsSubmitted(false)
                setFormData({ name: '', email: '', type: 'suggestion', rating: 5, message: '' })
              }}
              className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all duration-300"
            >
              Enviar Outro Feedback
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <MessageSquare className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Envie seu Feedback
            </h1>
            <p className="text-gray-300 text-lg">
              Sua opinião é muito importante para nós. Nos ajude a melhorar o SimplifiqueIA!
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Seu nome"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            {/* Tipo de Feedback */}
            <div>
              <label className="block text-sm font-medium mb-3">Tipo de Feedback</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Avaliação */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Como você avalia sua experiência? (1-5 estrelas)
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= formData.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Mensagem */}
            <div>
              <label className="block text-sm font-medium mb-2">Mensagem</label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors resize-none"
                placeholder="Compartilhe seus comentários, sugestões ou dúvidas..."
              />
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Enviar Feedback
                  </>
                )}
              </button>
              
              <a
                href={`mailto:${BRANDING.contact.supportEmail}`}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Mail className="h-5 w-5" />
                Enviar Email
              </a>
            </div>
          </form>
        </motion.div>

        {/* Informações de Contato Alternativas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-gray-400 text-sm"
        >
          <p>
            Você também pode nos contatar diretamente em:{' '}
            <a 
              href={`mailto:${BRANDING.contact.supportEmail}`}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              {BRANDING.contact.supportEmail}
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
