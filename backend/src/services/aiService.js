const DISCLAIMER = '\n\n⚠️ DISCLAIMER: This is AI-generated information for educational purposes only. It does NOT constitute legal advice. Please consult a qualified advocate for your specific situation.';

const callAI = async (messages, onChunk = null) => {
  // 1. Try Groq (Llama 3.3) first - High Reliability
  if (process.env.GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages.map(m => ({ 
            role: m.role === 'assistant' || m.role === 'bot' || m.role === 'model' ? 'assistant' : 'user', 
            content: m.content 
          })),
          temperature: 0.7,
          max_tokens: 1024,
          stream: !!onChunk // Only stream if onChunk callback provided
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Groq failed');
      }

      if (onChunk) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(message);
              const content = parsed.choices[0].delta?.content || '';
              if (content) {
                fullText += content;
                onChunk(content);
              }
            } catch (e) {
              // Ignore partial JSON errors
            }
          }
        }
        return fullText;
      } else {
        const data = await res.json();
        return data.choices[0].message.content;
      }
    } catch (e) { console.warn('Groq failed, falling back:', e.message); }
  }

  // 2. Try Gemini (Fallback)
  if (process.env.GEMINI_API_KEY) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : m.role,
            parts: [{ text: m.content }]
          })),
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        }),
      });
      const data = await res.json();
      if (res.ok) return data.candidates[0].content.parts[0].text;
      console.warn('Gemini failed:', data.error?.message);
    } catch (e) { console.warn('Gemini fetch error:', e.message); }
  }

  throw new Error('All AI providers failed or no API keys configured.');
};

module.exports = { callAI, DISCLAIMER };
