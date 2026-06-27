import { useEffect, useRef, useCallback, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

/**
 * Manages a STOMP WebSocket connection and thread-level subscriptions.
 */
export function useChatWebSocket(activeThreadId, onMessage) {
  const clientRef = useRef(null)
  const subscriptionRef = useRef(null)
  const onMessageRef = useRef(onMessage)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const subscribeToThread = useCallback((client, threadId) => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }
    if (!client?.connected || !threadId) return

    subscriptionRef.current = client.subscribe(
      `/topic/messages/${threadId}`,
      (frame) => {
        try {
          const msg = JSON.parse(frame.body)
          onMessageRef.current?.(msg)
        } catch {
          /* ignore malformed frames */
        }
      }
    )
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        clientRef.current = client
        setConnected(true)
      },
      onDisconnect: () => {
        setConnected(false)
      },
    })

    client.activate()

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      client.deactivate()
      clientRef.current = null
      setConnected(false)
    }
  }, [])

  useEffect(() => {
    if (!connected) return
    subscribeToThread(clientRef.current, activeThreadId)
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [activeThreadId, connected, subscribeToThread])

  const sendMessage = useCallback((threadId, content) => {
    const client = clientRef.current
    if (!client?.connected) return false
    client.publish({
      destination: `/app/chat/${threadId}/send`,
      body: JSON.stringify({ content }),
    })
    return true
  }, [])

  return { sendMessage, connected }
}
