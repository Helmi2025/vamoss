import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../api/axiosInstance'
import ChatPage from './ChatPage'

/**
 * Loads teamId for captains / team players, then renders ChatPage.
 * Supports ?chatWith=<userId> to open a private chat (individual players).
 */
export default function TeamChatWrapper() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const chatWith = searchParams.get('chatWith')

  const [teamId, setTeamId] = useState(null)
  const [loading, setLoading] = useState(user?.role === 'CAPTAIN' || (user?.role === 'PLAYER' && !user?.teamId))

  useEffect(() => {
    if (!user?.userId) {
      console.warn('TeamChatWrapper: user.userId is not available', user)
      return
    }

    async function fetchTeamId() {
      setLoading(true)
      try {
        if (user.role === 'CAPTAIN') {
          console.log('TeamChatWrapper: Fetching team for captain userId:', user.userId)
          const { data } = await api.get(`/api/captain/team/${user.userId}`)
          console.log('TeamChatWrapper: Captain team response:', data)
          if (data && data.teamId) {
            setTeamId(data.teamId)
          } else {
            console.warn('TeamChatWrapper: No teamId in response for captain', data)
          }
        } else if (user.role === 'PLAYER') {
          if (user.teamId) {
            console.log('TeamChatWrapper: Player has teamId from auth:', user.teamId)
            setTeamId(user.teamId)
          } else if (!user.sportId) {
            console.log('TeamChatWrapper: Fetching team for player userId:', user.userId)
            const { data } = await api.get(`/api/player/team/${user.userId}`)
            console.log('TeamChatWrapper: Player team response:', data)
            if (data && data.teamId) {
              setTeamId(data.teamId)
            } else {
              console.warn('TeamChatWrapper: No teamId in response for player', data)
            }
          }
        }
      } catch (err) {
        console.error('TeamChatWrapper: Failed to fetch team ID:', err)
        console.error('TeamChatWrapper: Error details:', err.response?.data)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamId()
  }, [user])

  if (loading) {
    return (
      <div className="empty-state">
        <span className="spinner light" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  // Individual players (without team) can still use chat for friend conversations
  // Only block captains/team players who must have a team
  const isIndividualPlayer = user?.role === 'PLAYER' && !teamId && !user?.teamId
  
  if (!teamId && !isIndividualPlayer) {
    return (
      <div className="chat-empty chat-empty-main">
        <p>No team chat available.</p>
        <p className="chat-empty-hint">
          {user?.role === 'CAPTAIN' 
            ? 'Create a team first to enable team chat.' 
            : 'You are not assigned to a team yet.'}
        </p>
      </div>
    )
  }

  return (
    <ChatPage
      teamId={teamId}
      initialOtherUserId={chatWith}
    />
  )
}
