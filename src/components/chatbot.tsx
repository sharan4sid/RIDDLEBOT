'use client';

import type { ChatInput, ChatOutput } from '@/ai/flows/chat-with-riddle-bot';
import { chatWithRiddleBot } from '@/ai/flows/chat-with-riddle-bot';
import { useState, useTransition, useRef, useEffect, useContext } from 'react'; // Added useContext
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, SendHorizonal, Bot, User, Sparkles } from 'lucide-react'; // Added Sparkles
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { RiddleContext } from '@/context/riddle-context'; // Import RiddleContext

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

// // Define and export the type for constraint updates (No longer needed for external use)
// export type ConstraintUpdate = { type: 'difficulty' | 'topic'; value: string };

// interface ChatbotProps {
//   // Callback to notify parent about constraint changes (No longer needed)
//   // onConstraintChange?: (update: ConstraintUpdate) => void;
// }


export default function Chatbot(/*{ onConstraintChange }: ChatbotProps*/) { // Remove prop
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { role: 'bot', content: "Hi there! 👋 Ask me to change the riddle's difficulty ('easy', 'medium', 'hard') or topic (e.g., 'animals', 'science')." },
  ]);
  const [isBotTyping, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null); // Ref for the viewport div inside ScrollArea
  const { setCurrentConstraints } = useContext(RiddleContext); // Get context setter

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChatFormData>({
    resolver: zodResolver(chatInputSchema),
  });

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  };

  // Scroll to bottom whenever chat history updates or bot starts/stops typing
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isBotTyping]);


  const handleSendMessage: SubmitHandler<ChatFormData> = (data) => {
    const userMessage: ChatMessage = { role: 'user', content: data.message };
    setChatHistory((prev) => [...prev, userMessage]);
    reset();

    startTransition(async () => {
      try {
        const input: ChatInput = { message: data.message };
        const output: ChatOutput = await chatWithRiddleBot(input);

        const botMessage: ChatMessage = { role: 'bot', content: output.response };
        setChatHistory((prev) => [...prev, botMessage]);

        // Update context if intent is recognized
        if (output.intent === 'difficulty' && output.value) {
          const constraintString = `difficulty: ${output.value}`;
          console.log("Chatbot: Setting context constraints:", constraintString);
          setCurrentConstraints(constraintString); // Update context
          toast({
              title: 'Difficulty Updated',
              description: `Riddle difficulty set to: ${output.value}`,
              icon: <Sparkles className="h-5 w-5 text-primary" />,
            });
          // Remove old callback call
          // console.log("Chatbot: Sending difficulty update to parent:", output.value);
          // onConstraintChange?.({ type: 'difficulty', value: output.value });
        } else if (output.intent === 'topic' && output.value) {
            const constraintString = `topic: ${output.value}`;
            console.log("Chatbot: Setting context constraints:", constraintString);
            setCurrentConstraints(constraintString); // Update context
           toast({
               title: 'Topic Updated',
               description: `Riddle topic set to: ${output.value}`,
               icon: <Sparkles className="h-5 w-5 text-primary" />,
             });
           // Remove old callback call
            // console.log("Chatbot: Sending topic update to parent:", output.value);
           // onConstraintChange?.({ type: 'topic', value: output.value });
        } else {
           // If intent is chit_chat or unknown, maybe clear constraints?
           // Or leave them as they are. Current behavior: leave as is.
           // To clear: setCurrentConstraints('');
        }

      } catch (error) {
        console.error('Error communicating with chatbot:', error);
        const errorMessage: ChatMessage = { role: 'bot', content: 'Sorry, I seem to be having trouble connecting. Please try again in a moment.' };
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
    // Adjusted styling for dialog integration
    <div className="flex flex-col h-[500px] max-h-[70vh] bg-card text-card-foreground"> {/* Adjusted height */}
       {/* Use ScrollArea with explicit viewport ref */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
         <div className="space-y-4" ref={viewportRef}> {/* Apply ref here */}
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={cn(
                'flex items-end gap-2 group', // Use items-end for better bubble alignment, add group for hover
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'bot' && (
                <Avatar className="h-8 w-8 border border-border transition-transform duration-150 group-hover:scale-110">
                  {/* Optional: Add AvatarImage if you have a bot image */}
                   {/* <AvatarImage src="/path/to/bot-avatar.png" alt="Bot Avatar" /> */}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm transition-shadow duration-150 group-hover:shadow-md', // Added shadow-sm and hover effect
                   msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none hover:bg-primary/90' // User bubble style + hover
                    : 'bg-muted text-muted-foreground rounded-bl-none hover:bg-muted/80' // Bot bubble style + hover
                )}
              >
                {msg.content}
              </div>
               {msg.role === 'user' && (
                 <Avatar className="h-8 w-8 border border-border transition-transform duration-150 group-hover:scale-110">
                    {/* Optional: Add AvatarImage if you have user images */}
                    {/* <AvatarImage src="/path/to/user-avatar.png" alt="User Avatar" /> */}
                   <AvatarFallback className="bg-secondary text-secondary-foreground">
                       <User className="h-5 w-5" />
                    </AvatarFallback>
                 </Avatar>
               )}
            </div>
          ))}
           {/* Bot typing indicator */}
           {isBotTyping && (
             <div className="flex items-end gap-2 justify-start">
               <Avatar className="h-8 w-8 border border-border">
                 <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-5 w-5" />
                 </AvatarFallback>
               </Avatar>
               <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm shadow-sm rounded-bl-none flex items-center space-x-1.5">
                  {/* More subtle typing animation */}
                  <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-pulse delay-0"></span>
                  <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-pulse delay-150"></span>
                  <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-pulse delay-300"></span>
               </div>
             </div>
           )}
        </div>
      </ScrollArea>
      {/* Input Area */}
      <div className="p-3 border-t border-border bg-background/50 rounded-b-lg">
        <form onSubmit={handleSubmit(handleSendMessage)} className="flex items-center gap-2">
          <Label htmlFor="chat-message" className="sr-only">Your Message</Label>
          <Input
            id="chat-message"
            placeholder="Send a message..."
            autoComplete="off"
            disabled={isBotTyping}
            className={cn(
                "flex-1 h-10 text-sm", // Ensure consistent height
                errors.message ? "border-destructive focus-visible:ring-destructive" : ""
            )}
            aria-invalid={errors.message ? "true" : "false"}
            aria-describedby="chat-error"
            {...register('message')}
          />
          <Button type="submit" size="icon" disabled={isBotTyping} aria-label="Send message" className="w-10 h-10 transition-transform duration-150 hover:scale-110 active:scale-100"> {/* Ensure button size and add hover */}
            {isBotTyping ? <Loader2 className="h-5 w-5 animate-spin" /> : <SendHorizonal className="h-5 w-5" />}
          </Button>
        </form>
         {errors.message && <p id="chat-error" className="text-xs text-destructive mt-1 pl-1">{errors.message.message}</p>}
      </div>
    </div>
  );
}
