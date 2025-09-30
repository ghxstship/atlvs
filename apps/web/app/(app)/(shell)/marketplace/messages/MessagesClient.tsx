'use client';

import { MessageSquare, Send, Search, Filter, Users, Clock, CheckCheck, Plus, Archive, Star } from "lucide-react";
import { useState, useEffect } from 'react';
import { 
 Card,
 Button,
 Input,
 Badge,
 Avatar
} from '@ghxstship/ui';

interface MessagesClientProps {
 orgId: string;
 userId: string;
}

interface Conversation {
 id: string;
 participant_name: string;
 participant_avatar?: string;
 last_message: string;
 last_message_time: string;
 unread_count: number;
 status: 'active' | 'archived';
 type: 'listing_inquiry' | 'project_proposal' | 'vendor_contact' | 'general';
}

interface Message {
 id: string;
 conversation_id: string;
 sender_id: string;
 sender_name: string;
 content: string;
 timestamp: string;
 read: boolean;
 type: 'text' | 'file' | 'system';
}

export default function MessagesClient({ orgId, userId }: MessagesClientProps) {
 const [conversations, setConversations] = useState<Conversation[]>([]);
 const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
 const [messages, setMessages] = useState<Message[]>([]);
 const [newMessage, setNewMessage] = useState('');
 const [searchQuery, setSearchQuery] = useState('');
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 loadConversations();
 }, [orgId]);

 const loadConversations = async () => {
 try {
 setLoading(true);
 
 // Mock data for now - would integrate with real messaging API
 const mockConversations: Conversation[] = [
 {
 id: '1',
 participant_name: 'TechCorp Solutions',
 participant_avatar: '',
 last_message: 'Thanks for your interest in our LED wall system...',
 last_message_time: '2 hours ago',
 unread_count: 2,
 status: 'active',
 type: 'listing_inquiry'
 },
 {
 id: '2',
 participant_name: 'AudioPro Services',
 participant_avatar: '',
 last_message: 'We can provide the sound engineering for your festival...',
 last_message_time: '1 day ago',
 unread_count: 0,
 status: 'active',
 type: 'project_proposal'
 },
 {
 id: '3',
 participant_name: 'LightMaster Inc',
 participant_avatar: '',
 last_message: 'Contract has been signed and uploaded to the system.',
 last_message_time: '3 days ago',
 unread_count: 0,
 status: 'active',
 type: 'vendor_contact'
 }
 ];

 setConversations(mockConversations);
 } catch (error) {
 console.error('Error loading conversations:', error);
 } finally {
 setLoading(false);
 }
 };

 const loadMessages = async (conversationId: string) => {
 try {
 // Mock messages for selected conversation
 const mockMessages: Message[] = [
 {
 id: '1',
 conversation_id: conversationId,
 sender_id: 'other-user',
 sender_name: 'TechCorp Solutions',
 content: 'Hi! I saw your listing for LED wall panels. Are they still available?',
 timestamp: '2024-01-15T10:00:00Z',
 read: true,
 type: 'text'
 },
 {
 id: '2',
 conversation_id: conversationId,
 sender_id: userId,
 sender_name: 'You',
 content: 'Yes, they are still available. What are your requirements?',
 timestamp: '2024-01-15T10:15:00Z',
 read: true,
 type: 'text'
 },
 {
 id: '3',
 conversation_id: conversationId,
 sender_id: 'other-user',
 sender_name: 'TechCorp Solutions',
 content: 'We need them for a 3-day event in March. Can you provide installation support?',
 timestamp: '2024-01-15T14:30:00Z',
 read: false,
 type: 'text'
 }
 ];

 setMessages(mockMessages);
 } catch (error) {
 console.error('Error loading messages:', error);
 }
 };

 const handleConversationSelect = (conversation: Conversation) => {
 setSelectedConversation(conversation);
 loadMessages(conversation.id);
 };

 const handleSendMessage = async () => {
 if (!newMessage.trim() || !selectedConversation) return;

 const message: Message = {
 id: Date.now().toString(),
 conversation_id: selectedConversation.id,
 sender_id: userId,
 sender_name: 'You',
 content: newMessage.trim(),
 timestamp: new Date().toISOString(),
 read: true,
 type: 'text'
 };

 setMessages(prev => [...prev, message]);
 setNewMessage('');

 // Update conversation last message
 setConversations(prev => prev.map(conv => 
 conv.id === selectedConversation.id 
 ? { ...conv, last_message: newMessage.trim(), last_message_time: 'now' }
 : conv
 ));
 };

 const filteredConversations = conversations.filter(conv =>
 conv.participant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const getTypeIcon = (type: string) => {
 switch (type) {
 case 'listing_inquiry': return MessageSquare;
 case 'project_proposal': return Users;
 case 'vendor_contact': return Star;
 default: return MessageSquare;
 }
 };

 const getTypeBadge = (type: string) => {
 switch (type) {
 case 'listing_inquiry': return { label: 'Listing', variant: 'secondary' as const };
 case 'project_proposal': return { label: 'Proposal', variant: 'success' as const };
 case 'vendor_contact': return { label: 'Vendor', variant: 'warning' as const };
 default: return { label: 'General', variant: 'outline' as const };
 }
 };

 return (
 <div className="stack-lg">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-heading-2">Messages</h1>
 <p className="color-muted">Communicate with marketplace participants</p>
 </div>
 <Button>
 <Plus className="h-4 w-4 mr-sm" />
 New Message
 </Button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-md h-[600px]">
 {/* Conversations List */}
 <Card className="p-md">
 <div className="flex items-center justify-between mb-md">
 <h3 className="text-heading-4">Conversations</h3>
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm">
 <Filter className="h-4 w-4" />
 </Button>
 <Button variant="outline" size="sm">
 <Archive className="h-4 w-4" />
 </Button>
 </div>
 </div>

 <div className="mb-md">
 <Input
 placeholder="Search conversations..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full"
 />
 </div>

 <div className="stack-xs overflow-y-auto max-h-[400px]">
 {filteredConversations.map((conversation) => {
 const TypeIcon = getTypeIcon(conversation.type);
 const typeBadge = getTypeBadge(conversation.type);

 return (
 <div
 key={conversation.id}
 onClick={() => handleConversationSelect(conversation)}
 className={`p-sm rounded cursor-pointer transition-colors hover:bg-muted ${
 selectedConversation?.id === conversation.id ? 'bg-muted' : ''
 }`}
 >
 <div className="flex items-start gap-sm">
 <Avatar className="h-10 w-10">
 <div className="flex items-center justify-center h-full w-full bg-primary/10">
 <TypeIcon className="h-5 w-5 color-primary" />
 </div>
 </Avatar>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-xs">
 <h4 className="text-body font-medium truncate">
 {conversation.participant_name}
 </h4>
 <div className="flex items-center gap-xs">
 {conversation.unread_count > 0 && (
 <Badge variant="destructive" size="sm">
 {conversation.unread_count}
 </Badge>
 )}
 <Badge variant={typeBadge.variant} size="sm">
 {typeBadge.label}
 </Badge>
 </div>
 </div>
 <p className="text-body-sm color-muted truncate mb-xs">
 {conversation.last_message}
 </p>
 <div className="flex items-center gap-xs text-body-sm color-muted">
 <Clock className="h-3 w-3" />
 <span>{conversation.last_message_time}</span>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </Card>

 {/* Messages Area */}
 <div className="lg:col-span-2">
 {selectedConversation ? (
 <Card className="p-0 h-full flex flex-col">
 {/* Message Header */}
 <div className="p-md border-b">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-sm">
 <Avatar className="h-8 w-8">
 <div className="flex items-center justify-center h-full w-full bg-primary/10">
 <Users className="h-4 w-4 color-primary" />
 </div>
 </Avatar>
 <div>
 <h3 className="text-heading-5">{selectedConversation.participant_name}</h3>
 <p className="text-body-sm color-muted">
 {getTypeBadge(selectedConversation.type).label} conversation
 </p>
 </div>
 </div>
 <div className="flex items-center gap-sm">
 <Button variant="outline" size="sm">
 <Archive className="h-4 w-4" />
 </Button>
 <Button variant="outline" size="sm">
 <Star className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </div>

 {/* Messages */}
 <div className="flex-1 p-md overflow-y-auto">
 <div className="stack-sm">
 {messages.map((message) => (
 <div
 key={message.id}
 className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
 >
 <div
 className={`max-w-[70%] p-sm rounded-lg ${
 message.sender_id === userId
 ? 'bg-primary text-primary-foreground'
 : 'bg-muted'
 }`}
 >
 <p className="text-body-sm">{message.content}</p>
 <div className="flex items-center justify-between mt-xs">
 <span className="text-xs opacity-70">
 {new Date(message.timestamp).toLocaleTimeString()}
 </span>
 {message.sender_id === userId && (
 <CheckCheck className="h-3 w-3 opacity-70" />
 )}
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Message Input */}
 <div className="p-md border-t">
 <div className="flex items-center gap-sm">
 <Input
 placeholder="Type your message..."
 value={newMessage}
 onChange={(e) => setNewMessage(e.target.value)}
 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
 className="flex-1"
 />
 <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
 <Send className="h-4 w-4" />
 </Button>
 </div>
 </div>
 </Card>
 ) : (
 <Card className="p-2xl text-center h-full flex items-center justify-center">
 <div>
 <MessageSquare className="h-12 w-12 mx-auto mb-md color-muted" />
 <h3 className="text-heading-4 mb-sm">Select a conversation</h3>
 <p className="color-muted">Choose a conversation from the list to start messaging</p>
 </div>
 </Card>
 )}
 </div>
 </div>
 </div>
 );
}
