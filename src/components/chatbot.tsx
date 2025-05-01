'use client';

import type { ChatInput, ChatOutput } from '@/ai/flows/chat-with-riddle-bot';
import { chatWithRiddleBot } from '@/ai/flows/chat-with-riddle-bot';
import { useState, useTransition, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, SendHorizonal, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Define the message structure for the chat history
interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
}

// Zod schema for the chat input form
const chatInputSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty.'),
});
type ChatFormData = z.infer<typeof chatInputSchema>;

export default function Chatbot() {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'bot', content: "Hi there! How can I help you adjust the riddles? Ask for 'easy', 'medium', 'hard' difficulty, or suggest a 'topic' like 'animals' or 'science'." },
  ]);
  const [isBotTyping, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea viewport

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatFormData>({
    resolver: zodResolver(chatInputSchema),
  });

   // Scroll to bottom whenever chat history updates
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Access the viewport element - ShadCN ScrollArea usually wraps content in a div
       const viewport = scrollAreaRef.current.querySelector<HTMLDivElement>(':scope > div');
       if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
       }
    }
  }, [chatHistory]);


  const handleSendMessage: SubmitHandler<ChatFormData> = (data) => {
    const userMessage: ChatMessage = { role: 'user', content: data.message };
    setChatHistory((prev) => [...prev, userMessage]);
    reset(); // Clear input field immediately

    startTransition(async () => {
      try {
        const input: ChatInput = { message: data.message };
        const output: ChatOutput = await chatWithRiddleBot(input);

        const botMessage: ChatMessage = { role: 'bot', content: output.response };
        setChatHistory((prev) => [...prev, botMessage]);

        // Optional: Notify user if difficulty/topic changed based on intent
        if (output.intent === 'difficulty' && output.value) {
          toast({ title: 'Difficulty Updated', description: `Next riddle difficulty set to: ${output.value}` });
          // Here you would typically trigger the riddle generation with the new constraint
          // e.g., fetchNewRiddle({ constraints: `Difficulty: ${output.value}` });
        } else if (output.intent === 'topic' && output.value) {
           toast({ title: 'Topic Updated', description: `Next riddle topic set to: ${output.value}` });
           // e.g., fetchNewRiddle({ constraints: `Topic: ${output.value}` });
        }

      } catch (error) {
        console.error('Error communicating with chatbot:', error);
        const errorMessage: ChatMessage = { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' };
        setChatHistory((prev) => [...prev, errorMessage]);
         toast({
          title: "Chat Error",
          description: "Could not get a response from the bot.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex flex-col h-[400px] border rounded-lg bg-card text-card-foreground shadow-sm">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'bot' && (
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[75%] rounded-lg p-3 text-sm break-words',
                   msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {msg.content}
              </div>
               {msg.role === 'user' && (
                 <Avatar className="h-8 w-8 border">
                   <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                 </Avatar>
               )}
            </div>
          ))}
           {isBotTyping && (
             <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8 border">
                 <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
               </Avatar>
               <div className="bg-muted text-muted-foreground rounded-lg p-3 text-sm flex items-center space-x-1">
                 <span className="animate-pulse">.</span>
                 <span className="animate-pulse delay-100">.</span>
                 <span className="animate-pulse delay-200">.</span>
               </div>
             </div>
           )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit(handleSendMessage)} className="flex items-center gap-2">
          <Label htmlFor="chat-message" className="sr-only">Your Message</Label>
          <Input
            id="chat-message"
            placeholder="Ask to change difficulty or topic..."
            autoComplete="off"
            disabled={isBotTyping}
            className="flex-1"
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby="chat-error"
            {...register('message')}
          />
          <Button type="submit" size="icon" disabled={isBotTyping} aria-label="Send message">
            {isBotTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
          </Button>
        </form>
         {errors.message && <p id="chat-error" className="text-sm text-destructive mt-1">{errors.message.message}</p>}
      </div>
    </div>
  );
}
