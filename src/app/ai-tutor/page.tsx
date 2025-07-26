"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Mic, MicOff, Send, Bot } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import AvatarViewer from "@/components/avatar/AvatarViewer";
import ConversationPanel from "@/components/avatar/ConversationPanel";

export default function AITutorPage() {
  const { user } = useUser();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    id: string;
    role: 'user' | 'tutor';
    content: string;
    timestamp: Date;
  }>>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.glb') || file.name.toLowerCase().endsWith('.gltf')) {
        setAvatarFile(file);
        const url = URL.createObjectURL(file);
        setAvatarUrl(url);
        toast.success("Avatar uploaded successfully!");
      } else {
        toast.error("Please upload a GLB or GLTF file");
      }
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!currentInput.trim() || isProcessing) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: currentInput,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsProcessing(true);

    try {
      // Call AI API for tutor response
      const response = await fetch('/api/ai-tutor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          conversation: conversation.slice(-10) // Send last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const tutorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'tutor' as const,
        content: data.response,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, tutorMessage]);
      
      // Trigger text-to-speech and avatar animation
      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to get response from AI tutor");
    } finally {
      setIsProcessing(false);
    }
  }, [currentInput, conversation, isProcessing]);

  const toggleListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    if (isListening) {
      setIsListening(false);
      // Stop speech recognition
    } else {
      setIsListening(true);
      // Start speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setCurrentInput(transcript);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Speech recognition error");
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  }, [isListening]);

  // if (!user) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Card className="w-96">
  //         <CardContent className="pt-6">
  //           <p className="text-center text-muted-foreground">
  //             Please sign in to use the AI Tutor
  //           </p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Tutor with 3D Avatar</h1>
        <p className="text-muted-foreground">
          Upload your GLB avatar and start learning with an AI tutor that responds with voice and expressions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              3D Avatar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!avatarUrl ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Upload Your GLB Avatar</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose a GLB or GLTF file to use as your AI tutor avatar
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Select Avatar File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".glb,.gltf"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-96 bg-muted rounded-lg">
                  <AvatarViewer 
                    avatarUrl={avatarUrl} 
                    isAnimating={isProcessing}
                    currentMessage={conversation[conversation.length - 1]?.content}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  Change Avatar
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".glb,.gltf"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conversation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Conversation History */}
              <ConversationPanel conversation={conversation} />
              
              {/* Input Section */}
              <div className="space-y-4">
                <Textarea
                  placeholder="Ask your AI tutor anything..."
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  className="min-h-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={toggleListening}
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!currentInput.trim() || isProcessing}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}