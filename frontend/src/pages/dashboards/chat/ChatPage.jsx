import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../api/axiosInstance'
import { useChatWebSocket } from '../../../hooks/useChatWebSocket'
import '../AdminDashboard.css'
import './ChatPage.css'

/* ── Avatar ── */
function Avatar({ src, name, size = 40 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  if (!src) {
    return (
      <div className="chat-avatar chat-avatar-placeholder" style={{ width: size, height: size, fontSize: size * 0.32 }}>
        {initials}
      </div>
    )
  }
  return <img src={src} alt={name} className="chat-avatar" style={{ width: size, height: size }} />
}

function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`
}

/* ── Message bubble ── */
function MessageBubble({ message, isOwn }) {
  return (
    <div className={`chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'}`}>
      {!isOwn && <Avatar src={message.senderPhotoUrl} name={message.senderName} size={36} />}
      <div className="chat-message-body">
        {!isOwn && <span className="chat-message-sender">{message.senderName}</span>}
        <div className="chat-message-content">{message.content}</div>
        <span className="chat-message-time">{formatTimestamp(message.timestamp)}</span>
      </div>
      {isOwn && <Avatar src={message.senderPhotoUrl} name={message.senderName} size={36} />}
    </div>
  )
}

/**
 * Shared chat page for captains, team players, and individual players.
 *
 * @param {object} props
 * @param {string|null} props.teamId - when set, ensures a team group thread exists on load
 * @param {string|null} props.initialThreadId - open this thread immediately (e.g. from friends list)
 * @param {string|null} props.initialOtherUserId - start a private chat with this user
 */
export default function ChatPage({ teamId = null, initialThreadId = null, initialOtherUserId = null }) {
  const { user } = useAuth()
  const userId = user?.userId

  const [threads, setThreads] = useState([])
  const [activeThreadId, setActiveThreadId] = useState(initialThreadId)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const initialHandled = useRef(false)

  const handleIncomingMessage = useCallback((msg) => {
    setMessages(prev => {
      if (prev.some(m => m.id === msg.id)) return prev
      return [...prev, msg]
    })
    setThreads(prev => prev.map(t =>
      t.id === msg.threadId
        ? { ...t, lastMessage: msg, lastMessageAt: msg.timestamp }
        : t
    ).sort((a, b) => {
      const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
      const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
      return tb - ta
    }))
  }, [])

  const { sendMessage: sendViaWs } = useChatWebSocket(activeThreadId, handleIncomingMessage)

  const fetchThreads = useCallback(async () => {
    setLoadingThreads(true)
    setError('')
    try {
      const { data } = await api.get('/api/chat/threads')
      setThreads(data)
      return data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversations.')
      return []
    } finally {
      setLoadingThreads(false)
    }
  }, [])

  const loadMessages = useCallback(async (threadId) => {
    if (!threadId || threadId.trim() === '') {
      console.warn('loadMessages called with null or empty threadId')
      return
    }
    setLoadingMessages(true)
    try {
      const { data } = await api.get(`/api/chat/threads/${threadId}/messages`)
      setMessages(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages.')
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  /* Initial setup: ensure team thread + handle deep-link params */
  useEffect(() => {
    if (initialHandled.current || !userId) {
      if (!userId) {
        console.error('ChatPage: userId is not available from AuthContext', user)
      }
      return
    }
    initialHandled.current = true

    async function init() {
      console.log('ChatPage: Initializing with userId:', userId, 'teamId:', teamId)
      
      if (teamId) {
        try {
          console.log('ChatPage: Creating team thread for teamId:', teamId)
          await api.post(`/api/chat/threads/team/${teamId}`)
          console.log('ChatPage: Team thread created/fetched successfully')
        } catch (err) {
          console.error('ChatPage: Failed to create team thread:', err)
          console.error('ChatPage: Error response:', err.response?.data)
          /* thread may already exist */
        }
      }

      const data = await fetchThreads()

      if (initialOtherUserId) {
        try {
          const { data: res } = await api.post('/api/chat/threads/private', { otherUserId: initialOtherUserId })
          setActiveThreadId(res.threadId)
          await loadMessages(res.threadId)
          await fetchThreads()
          return
        } catch (err) {
          setError(err.response?.data?.message || 'Could not start private chat.')
        }
      }

      if (initialThreadId) {
        setActiveThreadId(initialThreadId)
        await loadMessages(initialThreadId)
      } else if (teamId) {
        // Auto-open team chat for captains/team players
        const teamThread = data.find(t => t.teamId === teamId && t.type === 'GROUP')
        if (teamThread) {
          setActiveThreadId(teamThread.id)
          await loadMessages(teamThread.id)
        } else if (data.length === 1) {
          setActiveThreadId(data[0].id)
          await loadMessages(data[0].id)
        }
      } else if (data.length === 1) {
        setActiveThreadId(data[0].id)
        await loadMessages(data[0].id)
      }
    }

    init()
  }, [userId, teamId, initialThreadId, initialOtherUserId, fetchThreads, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function selectThread(threadId) {
    setActiveThreadId(threadId)
    setMessages([])
    await loadMessages(threadId)
  }

  async function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || !activeThreadId || sending) return

    setSending(true)
    setInput('')

    const sentViaWs = sendViaWs(activeThreadId, text)
    if (sentViaWs) {
      setSending(false)
      return
    }

    try {
      const { data } = await api.post(`/api/chat/threads/${activeThreadId}/messages`, { content: text })
      handleIncomingMessage(data)
    } catch (err) {
      setInput(text)
      setError(err.response?.data?.message || 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  const activeThread = threads.find(t => t.id === activeThreadId)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Messages</h1>
        <p className="page-subtitle">Chat with your team or friends</p>
      </div>

      {error && (
        <div className="form-error" style={{ marginBottom: 16 }}>
          {error}
          <button onClick={() => setError('')} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#c6a84b', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div className="chat-layout">
        {/* Thread list */}
        <aside className="chat-thread-list">
          {loadingThreads ? (
            <div className="chat-empty"><span className="spinner light" style={{ width: 24, height: 24 }} /></div>
          ) : threads.length === 0 ? (
            <div className="chat-empty">
              <p>No conversations yet.</p>
              {teamId && <p className="chat-empty-hint">Your team chat will appear here.</p>}
            </div>
          ) : (
            threads.map(thread => (
              <button
                key={thread.id}
                className={`chat-thread-item ${activeThreadId === thread.id ? 'active' : ''}`}
                onClick={() => selectThread(thread.id)}
              >
                <Avatar src={thread.displayPhotoUrl} name={thread.displayName} size={44} />
                <div className="chat-thread-info">
                  <div className="chat-thread-name">{thread.displayName}</div>
                  {thread.lastMessage && (
                    <div className="chat-thread-preview">
                      {thread.lastMessage.senderId === userId ? 'You: ' : ''}
                      {thread.lastMessage.content}
                    </div>
                  )}
                </div>
                {thread.type === 'GROUP' && (
                  <span className="chat-thread-badge">Team</span>
                )}
              </button>
            ))
          )}
        </aside>

        {/* Message area */}
        <section className="chat-main">
          {!activeThreadId ? (
            <div className="chat-empty chat-empty-main">
              <p>Select a conversation to start messaging</p>
            </div>
          ) : (
            <>
              <div className="chat-main-header">
                <Avatar src={activeThread?.displayPhotoUrl} name={activeThread?.displayName} size={40} />
                <div>
                  <div className="chat-main-title">{activeThread?.displayName || 'Chat'}</div>
                  {activeThread?.type === 'GROUP' && (
                    <div className="chat-main-subtitle">
                      {activeThread.participants?.length || 0} members
                    </div>
                  )}
                </div>
              </div>

              <div className="chat-messages">
                {loadingMessages ? (
                  <div className="chat-empty"><span className="spinner light" style={{ width: 24, height: 24 }} /></div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty"><p>No messages yet. Say hello!</p></div>
                ) : (
                  messages.map(msg => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwn={msg.senderId === userId}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message…"
                  disabled={sending}
                  maxLength={2000}
                />
                <button type="submit" className="btn-gold" disabled={!input.trim() || sending}>
                  Send
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
