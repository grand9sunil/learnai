import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { message, conversation } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Build conversation context for the AI tutor
    const messages = [
      {
        role: 'system' as const,
        content: `You are an AI tutor with a friendly, encouraging personality. Your goal is to help users learn by:
        1. Answering questions clearly and comprehensively
        2. Breaking down complex topics into digestible parts
        3. Providing examples and analogies to aid understanding
        4. Asking follow-up questions to ensure comprehension
        5. Adapting your teaching style to the user's level
        6. Being patient and supportive
        
        Keep responses conversational but informative. Use emojis occasionally to maintain engagement. 
        If the user asks about something outside educational topics, gently redirect them back to learning.`
      },
      // Include recent conversation history for context
      ...conversation.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response. Please try again.';

    // Generate speech for the response using OpenAI's TTS
    let audioUrl = null;
    try {
      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: aiResponse,
      });

      const buffer = Buffer.from(await speech.arrayBuffer());
      
      // In a production environment, you would save this to a cloud storage service
      // For now, we'll create a data URL
      const base64Audio = buffer.toString('base64');
      audioUrl = `data:audio/mp3;base64,${base64Audio}`;
    } catch (audioError) {
      console.error('Error generating speech:', audioError);
      // Continue without audio if TTS fails
    }

    return NextResponse.json({
      response: aiResponse,
      audioUrl: audioUrl,
    });

  } catch (error) {
    console.error('Error in AI tutor chat:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}