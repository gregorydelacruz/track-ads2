import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function getChatCompletion(messages: { role: 'user' | 'assistant'; content: string }[]) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a compassionate and knowledgeable sobriety companion. Your role is to:
            - Provide emotional support and encouragement
            - Offer practical advice for maintaining sobriety
            - Help identify and manage triggers
            - Share coping strategies and healthy alternatives
            - Maintain a non-judgmental and understanding tone
            - Focus on progress and positive reinforcement
            - Encourage professional help when appropriate
            Never provide medical advice or diagnoses.
            Keep responses concise but informative, around 2-3 short paragraphs.`
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 350  // Increased from 150 to allow longer responses
    });

    return completion.choices[0]?.message?.content || 'I apologize, but I am unable to provide a response at the moment.';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get AI response');
  }
}