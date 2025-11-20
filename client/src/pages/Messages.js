import React, { useEffect, useMemo, useState } from 'react';
import api from '../config/axios';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  TextField,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useAuth } from '../context/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [newConversationParticipants, setNewConversationParticipants] = useState([]);
  const [conversationName, setConversationName] = useState('');

  useEffect(() => {
    fetchConversations();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (!selectedConversation?._id) return () => {};
    const db = getDatabase();
    const messagesRef = ref(db, `messages/${selectedConversation._id}`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const parsed = Object.keys(data)
        .map((key) => data[key])
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(parsed);
    });

    return () => off(messagesRef);
  }, [selectedConversation?._id]);

  const fetchConversations = async (options = {}) => {
    try {
      const response = await api.get('/api/messages/conversations');
      setConversations(response.data);
      if (options.selectId) {
        const newlyCreated = response.data.find((conversation) => conversation._id === options.selectId);
        setSelectedConversation(newlyCreated || response.data[0] || null);
      } else if (!selectedConversation && response.data.length > 0) {
        setSelectedConversation(response.data[0]);
      } else if (response.data.length === 0) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Failed to load conversations', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get('/api/team');
      setTeamMembers(response.data.filter((member) => member._id !== user?.id));
    } catch (error) {
      console.error('Failed to load team members', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      await api.post(`/api/messages/conversations/${selectedConversation._id}/messages`, {
        content: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  const handleCreateConversation = async () => {
    if (!newConversationParticipants.length) return;
    try {
      const response = await api.post('/api/messages/conversations', {
        name: conversationName || undefined,
        participants: newConversationParticipants,
      });
      setConversationName('');
      setNewConversationParticipants([]);
      await fetchConversations({ selectId: response.data._id });
    } catch (error) {
      console.error('Failed to create conversation', error);
    }
  };

  const selectedParticipants = useMemo(() => {
    if (!selectedConversation) return [];
    return selectedConversation.participants || [];
  }, [selectedConversation]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Team Messages
      </Typography>
      <Box display="flex" gap={3}>
        <Paper sx={{ width: 320, p: 2, height: '75vh', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" gutterBottom>
            Conversations
          </Typography>
          <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
            {conversations.map((conversation) => (
              <ListItemButton
                key={conversation._id}
                selected={selectedConversation?._id === conversation._id}
                onClick={() => setSelectedConversation(conversation)}
              >
                <ListItemText
                  primary={conversation.name || 'Direct Chat'}
                  secondary={
                    conversation.lastMessage
                      ? `${conversation.lastMessage.content?.slice(0, 40) || ''}`
                      : 'No messages yet'
                  }
                />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>
            Start new conversation
          </Typography>
          <TextField
            label="Conversation name (optional)"
            fullWidth
            size="small"
            value={conversationName}
            onChange={(e) => setConversationName(e.target.value)}
            sx={{ mb: 1 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 1 }}>
            <InputLabel id="participants-label">Participants</InputLabel>
            <Select
              labelId="participants-label"
              multiple
              value={newConversationParticipants}
              onChange={(e) => setNewConversationParticipants(e.target.value)}
              input={<OutlinedInput label="Participants" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => {
                    const member = teamMembers.find((m) => m._id === value);
                    return <Chip key={value} label={member?.name || value} />;
                  })}
                </Box>
              )}
            >
              {teamMembers.map((member) => (
                <MenuItem key={member._id} value={member._id}>
                  {member.name} ({member.role})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleCreateConversation} disabled={!newConversationParticipants.length}>
            Create Conversation
          </Button>
        </Paper>

        <Paper sx={{ flexGrow: 1, p: 2, height: '75vh', display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {selectedConversation.name ||
                    selectedParticipants
                      .filter((participant) => participant.id !== user?.id)
                      .map((participant) => participant.name || participant.email)
                      .join(', ')}
                </Typography>
                <Box>
                  {selectedParticipants.map((participant) => (
                    <Chip
                      key={participant.id}
                      label={participant.name || participant.email}
                      size="small"
                      sx={{ mr: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
              <Divider />
              <Box sx={{ flexGrow: 1, overflowY: 'auto', my: 2 }}>
                {messages.map((message) => (
                  <Box
                    key={message._id}
                    display="flex"
                    justifyContent={message.sender === user?.id ? 'flex-end' : 'flex-start'}
                    mb={1.5}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: message.sender === user?.id ? 'primary.main' : 'grey.100',
                        color: message.sender === user?.id ? 'primary.contrastText' : 'text.primary',
                      }}
                    >
                      <Typography variant="body2" gutterBottom>
                        {message.content}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {new Date(message.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Divider />
              <Box display="flex" gap={1} mt={2}>
                <TextField
                  fullWidth
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  minRows={2}
                />
                <Button variant="contained" onClick={handleSendMessage}>
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Box
              flexGrow={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
            >
              <Typography variant="h6" gutterBottom>
                Select a conversation to start chatting
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose an existing conversation or create a new one from the list.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Messages;

