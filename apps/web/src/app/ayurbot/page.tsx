'use client'

import { useState } from 'react'
import { Button } from '@ayurconnect/ui'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AyurBotPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [type, setType] = useState('general')

  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    try {
      const res = await fetch('/api/ayurbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, type })
      })
      const data = await res.json()
      
      const assistantMessage: Message = { role: 'assistant', content: data.response }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again.' }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const startPrakritiQuiz = () => {
    setType('prakriti')
    const quizMessage: Message = { role: 'assistant', content: 'Let\'s determine your Prakriti! Tell me about your physical characteristics, preferences, and daily habits.' }
    setMessages([quizMessage])
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">AyurBot AI Assistant</h1>
      
      <div className="mb-4 flex gap-2">
        <Button onClick={() => setType('general')}>General Chat</Button>
        <Button onClick={startPrakritiQuiz}>Prakriti Quiz</Button>
        <Button onClick={() => setType('herb')}>Herb Lookup</Button>
        <Button onClick={() => setType('symptom')}>Symptom Checker</Button>
      </div>
      
      <div className="border rounded-lg h-96 overflow-y-auto p-4 mb-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {msg.content}
            </span>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask AyurBot anything..."
          className="flex-1 border p-2 rounded"
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
}