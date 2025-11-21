/**
 * Admin Dashboard - Conversations Page
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageSquare, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Conversation = {
  id: string;
  sessionId: string;
  startedAt: string;
  endedAt: string | null;
  messageCount: number | null;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata: any;
};

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<{
    conversation: Conversation;
    messages: Message[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const response = await fetch('/api/conversations?limit=100');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function viewConversation(id: string) {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (!response.ok) throw new Error('Failed to fetch conversation');
      const data = await response.json();
      setSelectedConversation(data);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      alert('Failed to load conversation');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-500 mt-2">View all customer chat sessions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Conversations</CardTitle>
          <CardDescription>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} in
            total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No conversations yet
              </h3>
              <p className="text-gray-500">
                Conversations will appear here when users start chatting
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session ID</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversations.map((conv) => (
                  <TableRow key={conv.id}>
                    <TableCell className="font-mono text-xs">
                      {conv.sessionId.substring(0, 20)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{conv.messageCount ?? 0} messages</Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(conv.startedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {conv.endedAt
                        ? `${Math.round((new Date(conv.endedAt).getTime() - new Date(conv.startedAt).getTime()) / 1000 / 60)} min`
                        : 'Active'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewConversation(conv.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Conversation Details</DialogTitle>
            <DialogDescription>
              {selectedConversation && (
                <span className="font-mono text-xs">
                  {selectedConversation.conversation.sessionId}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedConversation && (
            <div className="space-y-4 mt-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase">
                        {message.role}
                      </span>
                      <span className="text-xs opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {message.role === 'assistant' && message.metadata?.sources && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-semibold mb-2">
                          Sources ({message.metadata.sources.length}):
                        </p>
                        {message.metadata.sources.map(
                          (source: any, index: number) => (
                            <div key={index} className="text-xs opacity-70 mb-1">
                              • {source.documentTitle} (similarity:{' '}
                              {source.similarity?.toFixed(3)})
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
