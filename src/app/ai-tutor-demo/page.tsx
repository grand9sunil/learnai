"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Mic, MicOff, Send, Bot } from "lucide-react";
import { toast } from "sonner";

// Simplified components for demo
function SimpleAvatarViewer({ avatarUrl, isAnimating, currentMessage }: any) {
  return (
    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-br from-background to-muted rounded-lg">
      <div className="text-center">
        <div className={`relative ${isAnimating ? 'animate-pulse' : ''}`}>
          <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Bot className="h-16 w-16 text-white" />
          </div>
          {isAnimating && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>
        <p className="text-lg font-semibold">AI Tutor</p>
        <p className="text-sm text-muted-foreground">Ready to help you learn!</p>
        {currentMessage && isAnimating && (
          <div className="mt-4 p-2 bg-muted rounded-lg max-w-xs">
            <p className="text-xs text-muted-foreground">Currently saying:</p>
            <p className="text-sm">{currentMessage.slice(0, 50)}{currentMessage.length > 50 ? '...' : ''}</p>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-background/80 p-2 rounded">
        <p>3D Avatar: {avatarUrl ? 'Uploaded' : 'Not uploaded'}</p>
        <p className="text-[10px]">Demo Mode</p>
      </div>
    </div>
  );
}

function SimpleConversationPanel({ conversation }: any) {
  if (conversation.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-center p-8">
        <div className="space-y-2">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg font-medium">Welcome to AI Tutor!</p>
          <p className="text-sm text-muted-foreground">
            Start a conversation by typing a message
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full overflow-y-auto p-4 space-y-4">
      {conversation.map((message: any) => (
        <div
          key={message.id}
          className={`flex gap-3 max-w-[80%] ${
            message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
          }`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.role === 'user' 
              ? "bg-primary text-primary-foreground" 
              : "bg-secondary text-secondary-foreground"
          }`}>
            {message.role === 'user' ? "U" : <Bot className="h-4 w-4" />}
          </div>
          
          <div className={`space-y-1 ${
            message.role === 'user' ? "text-right" : "text-left"
          }`}>
            <div className={`rounded-lg px-3 py-2 text-sm ${
              message.role === 'user'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}>
              {message.content}
            </div>
            <p className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AITutorDemo() {
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

    // Simulate AI response for demo
    setTimeout(() => {
      const responses = [
        "That's a great question! Let me help you understand this concept better. 📚",
        "I can see you're curious about learning. That's wonderful! Let me break this down for you step by step. 🎯",
        "Excellent point! Here's how I would approach this topic... 💡",
        "I love your enthusiasm for learning! Let me provide you with a comprehensive explanation. 🚀",
        "That's an interesting question that many students ask. Let me help clarify this for you! ✨"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const tutorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'tutor' as const,
        content: randomResponse,
        timestamp: new Date()
      };
      
      setConversation(prev => [...prev, tutorMessage]);
      setIsProcessing(false);
      
      // Simulate text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(randomResponse.replace(/[📚🎯💡🚀✨]/g, ''));
        utterance.rate = 0.9;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
      }
    }, 1500);
  }, [currentInput, isProcessing]);

  const toggleListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Speech recognition not supported in this browser");
      return;
    }

    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      toast.info("Speech recognition started - speak now!");
      
      setTimeout(() => {
        setIsListening(false);
        setCurrentInput("Hello AI tutor, can you help me learn about React?");
        toast.success("Speech captured!");
      }, 2000);
    }
  }, [isListening]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">AI Tutor Demo</h1>
          <p className="text-sm text-muted-foreground">
            Demonstration of 3D Avatar AI Tutor functionality
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                  <div className="h-96">
                    <SimpleAvatarViewer 
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
                <SimpleConversationPanel conversation={conversation} />
                
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

        {/* Features Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI Tutor Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">3D Avatar Upload</h3>
                <p className="text-sm text-muted-foreground">Upload GLB/GLTF models for personalized avatars</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Mic className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">Voice Input</h3>
                <p className="text-sm text-muted-foreground">Speak your questions using speech recognition</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Send className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-medium mb-1">AI Responses</h3>
                <p className="text-sm text-muted-foreground">Get intelligent tutoring responses with voice synthesis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}