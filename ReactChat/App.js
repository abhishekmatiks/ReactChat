import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View, // this let me use <div>
  TextInput,
  TouchableOpacity,
  FlatList, // auto scroll 
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import io from 'socket.io-client';

const socket = io('http://192.168.233.18:3000');

export default function App() {
  const [username, setUsername] = useState('');
  const [enteredUsername, setEnteredUsername] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const flatListRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket');
    });

    socket.on('receive_message', (data) => {
      const timestamp = new Date().toISOString();
      setMessages((prev) => [...prev, { ...data, timestamp }]);
    });

    return () => {
      socket.off('receive_message');
      socket.off('connect');
    };
  }, []);

  const handleSend = () => {
    if (!message.trim()) return;
    socket.emit('send_message', { message: message.trim(), username });
    setMessage('');
  };

  const handleSetUsername = () => {
    if (!username.trim()) return;
    socket.emit('set_username', username.trim());
    setEnteredUsername(true);
  };

  useEffect(() => {
    if (enteredUsername) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [enteredUsername]);

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderItem = ({ item }) => {
    const isMe = item.username === username;
    return (
      <View
        style={[
        styles.messageContainer,
        isMe ? styles.myMessageContainer : styles.otherMessageContainer,
    ]}>

        {!isMe && <Text style={styles.username}>{item.username}</Text>}
        <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.otherMessage]}>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {!enteredUsername ? (
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Enter Your Name</Text>
          <TextInput
            style={styles.usernameInput}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleSetUsername}>
            <Text style={styles.loginButtonText}>Join Chat</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.timestamp || index.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.chatContainer}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.messageInput}
              placeholder="Type Something"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  loginTitle: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  usernameInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    backgroundColor: '#3478f6',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },

  chatContainer: {
    padding: 35,
    paddingBottom: 10,
  },
  messageContainer: {
    marginVertical: 5,
    maxWidth: '70%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  username: {
    fontSize: 12,
    color: '#000',
    marginBottom: 2,
    marginLeft: 5,
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  myMessage: {
    backgroundColor: '#3478f6',
  },
  otherMessage: {
    backgroundColor: '#94cf59',
  },
  messageText: {
    color: '#fff',
  },
  timeText: {
    fontSize: 10,
    color: '#000',
    marginTop: 4,
    textAlign: 'right',
  },

  inputRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    maxHeight: 100,
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#3478f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
