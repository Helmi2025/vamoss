import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../api/axiosInstance'
import '../AdminDashboard.css'

/* ── Icons ── */
const IconUsers   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconSent    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
const IconInbox   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
const IconTrash   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
const IconCheck   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconClose   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconUser    = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IconMessage = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>

/* ── Avatar ── */
function Avatar({ src, name, size = 52 }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
  const placeholder = (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(198,168,75,0.1)', border: '1px solid rgba(198,168,75,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#c6a84b', fontSize: size * 0.32, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  )
  if (!src) return placeholder
  return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(198,168,75,0.28)' }} />
}

/* ── Confirmation modal ── */
function ConfirmModal({ title, message, confirmLabel, confirmClass, onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} disabled={loading} aria-label="Close"><IconClose /></button>
        </div>
        <p className="confirm-text">{message}</p>
        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={confirmClass} onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Gender badge helper ── */
function GenderBadge({ gender }) {
  if (!gender) return null
  const color = gender === 'MALE' ? '#7eb8f7' : '#f7a8c4'
  const label = gender === 'MALE' ? '♂ Man' : '♀ Woman'
  return <span style={{ fontSize: 11, color, fontWeight: 600 }}>{label}</span>
}

/* ── Tab: Friends ── */
function FriendsTab({ friends, onMessage }) {
  if (friends.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon"><IconUser /></div>
      <p>You have no friends yet. Explore players to send requests!</p>
    </div>
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
      {friends.map(f => (
        <div key={f.playerId} style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 16px', borderRadius: 12,
          background: 'rgba(129,199,132,0.04)', border: '1px solid rgba(129,199,132,0.18)',
        }}>
          <Avatar src={f.photoUrl} name={f.username} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f0e6c8' }}>{f.username}</div>
            <GenderBadge gender={f.gender} />
          </div>
          <button
            onClick={() => onMessage(f.playerId)}
            title="Send message"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(198,168,75,0.08)', border: '1px solid rgba(198,168,75,0.3)',
              color: '#c6a84b', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,168,75,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(198,168,75,0.08)'}
          >
            <IconMessage /> Chat
          </button>
        </div>
      ))}
    </div>
  )
}

/* ── Tab: Sent Requests ── */
function SentTab({ sent, onCancel }) {
  const [confirm, setConfirm] = useState(null)   // { requestId, name }
  const [busy,    setBusy]    = useState(false)
  const { user }  = useAuth()

  async function doCancel() {
    setBusy(true)
    try {
      await api.delete(`/api/player/friends/request/${confirm.requestId}`, {
        params: { requesterId: user.userId },
      })
      onCancel(confirm.requestId)
      setConfirm(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel request.')
    } finally {
      setBusy(false)
    }
  }

  if (sent.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon"><IconUser /></div>
      <p>No pending sent requests.</p>
    </div>
  )

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sent.map(r => (
          <div key={r.requestId} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(198,168,75,0.14)',
          }}>
            <Avatar src={r.receiverPhotoUrl} name={r.receiverUsername} size={46} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0e6c8' }}>{r.receiverUsername}</div>
              <GenderBadge gender={r.receiverGender} />
            </div>
            <button
              onClick={() => setConfirm({ requestId: r.requestId, name: r.receiverUsername })}
              title="Cancel request"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 8,
                background: 'rgba(220,53,69,0.07)', border: '1px solid rgba(220,53,69,0.25)',
                color: '#e07070', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,53,69,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,53,69,0.07)'}
            >
              <IconTrash /> Cancel
            </button>
          </div>
        ))}
      </div>

      {confirm && (
        <ConfirmModal
          title="Cancel Request"
          message={<>Cancel your friend request to <strong style={{ color: '#f0e6c8' }}>{confirm.name}</strong>?</>}
          confirmLabel="Cancel Request"
          confirmClass="btn-danger"
          onConfirm={doCancel}
          onClose={() => setConfirm(null)}
          loading={busy}
        />
      )}
    </>
  )
}

/* ── Tab: Received Requests ── */
function ReceivedTab({ received, onAccept, onReject }) {
  const [confirm, setConfirm] = useState(null)   // { type:'accept'|'reject', requestId, name }
  const [busy,    setBusy]    = useState(false)
  const { user }  = useAuth()

  async function doAction() {
    setBusy(true)
    try {
      if (confirm.type === 'accept') {
        await api.put(`/api/player/friends/request/${confirm.requestId}/accept`, null, {
          params: { receiverId: user.userId },
        })
        onAccept(confirm.requestId)
      } else {
        await api.delete(`/api/player/friends/request/${confirm.requestId}/reject`, {
          params: { receiverId: user.userId },
        })
        onReject(confirm.requestId)
      }
      setConfirm(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.')
    } finally {
      setBusy(false)
    }
  }

  if (received.length === 0) return (
    <div className="empty-state">
      <div className="empty-state-icon"><IconUser /></div>
      <p>No pending received requests.</p>
    </div>
  )

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {received.map(r => (
          <div key={r.requestId} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(198,168,75,0.14)',
          }}>
            <Avatar src={r.senderPhotoUrl} name={r.senderUsername} size={46} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#f0e6c8' }}>{r.senderUsername}</div>
              <GenderBadge gender={r.senderGender} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {/* Accept */}
              <button
                onClick={() => setConfirm({ type: 'accept', requestId: r.requestId, name: r.senderUsername })}
                title="Accept"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(129,199,132,0.08)', border: '1px solid rgba(129,199,132,0.3)',
                  color: '#81c784', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(129,199,132,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(129,199,132,0.08)'}
              >
                <IconCheck /> Accept
              </button>
              {/* Reject */}
              <button
                onClick={() => setConfirm({ type: 'reject', requestId: r.requestId, name: r.senderUsername })}
                title="Reject"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 14px', borderRadius: 8,
                  background: 'rgba(220,53,69,0.07)', border: '1px solid rgba(220,53,69,0.25)',
                  color: '#e07070', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,53,69,0.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,53,69,0.07)'}
              >
                <IconTrash /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirm && (
        <ConfirmModal
          title={confirm.type === 'accept' ? 'Accept Request' : 'Reject Request'}
          message={
            confirm.type === 'accept'
              ? <><strong style={{ color: '#f0e6c8' }}>{confirm.name}</strong> will be added to your friends.</>
              : <>Reject the friend request from <strong style={{ color: '#f0e6c8' }}>{confirm.name}</strong>? This cannot be undone.</>
          }
          confirmLabel={confirm.type === 'accept' ? 'Accept' : 'Reject'}
          confirmClass={confirm.type === 'accept' ? 'btn-gold' : 'btn-danger'}
          onConfirm={doAction}
          onClose={() => setConfirm(null)}
          loading={busy}
        />
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════
   PLAYER FRIENDS — MAIN COMPONENT
═══════════════════════════════════════════════ */
export default function PlayerFriends() {
  const { user }  = useAuth()
  const playerId  = user?.userId
  const [, setSearchParams] = useSearchParams()

  function openChat(friendId) {
    setSearchParams({ section: 'messages', chatWith: friendId })
  }

  const [data,     setData]     = useState({ friends: [], sentRequests: [], receivedRequests: [] })
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [activeTab, setActiveTab] = useState('friends')

  const fetchData = useCallback(async () => {
    if (!playerId) return
    setLoading(true); setError('')
    try {
      const { data: res } = await api.get(`/api/player/friends/${playerId}`)
      setData(res)
    } catch (err) {
      setError(`Failed to load friends. ${err.response?.status ? `(HTTP ${err.response.status})` : '(Network error)'}`)
    } finally {
      setLoading(false)
    }
  }, [playerId])

  useEffect(() => { fetchData() }, [fetchData])

  /* Optimistic updates after actions */
  function handleCancel(requestId) {
    setData(d => ({ ...d, sentRequests: d.sentRequests.filter(r => r.requestId !== requestId) }))
  }

  function handleAccept(requestId) {
    setData(d => {
      const req = d.receivedRequests.find(r => r.requestId === requestId)
      const newFriend = req ? { playerId: req.senderId, username: req.senderUsername, photoUrl: req.senderPhotoUrl, gender: req.senderGender } : null
      return {
        friends: newFriend ? [...d.friends, newFriend] : d.friends,
        sentRequests: d.sentRequests,
        receivedRequests: d.receivedRequests.filter(r => r.requestId !== requestId),
      }
    })
  }

  function handleReject(requestId) {
    setData(d => ({ ...d, receivedRequests: d.receivedRequests.filter(r => r.requestId !== requestId) }))
  }

  const tabs = [
    { key: 'friends',  label: 'Friends',          Icon: IconUsers, count: data.friends.length },
    { key: 'sent',     label: 'Requests Sent',     Icon: IconSent,  count: data.sentRequests.length },
    { key: 'received', label: 'Requests Received', Icon: IconInbox, count: data.receivedRequests.length },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Friends</h1>
        <p className="page-subtitle">Manage your connections</p>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(({ key, label, Icon, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              background: activeTab === key ? 'rgba(198,168,75,0.15)' : 'rgba(255,255,255,0.04)',
              color: activeTab === key ? '#c6a84b' : 'rgba(240,230,200,0.5)',
              borderBottom: activeTab === key ? '2px solid rgba(198,168,75,0.7)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (activeTab !== key) { e.currentTarget.style.color = '#f0e6c8'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' } }}
            onMouseLeave={e => { if (activeTab !== key) { e.currentTarget.style.color = 'rgba(240,230,200,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' } }}
          >
            <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}><Icon /></span>
            {label}
            {count > 0 && (
              <span style={{
                background: activeTab === key ? '#c6a84b' : 'rgba(198,168,75,0.3)',
                color: activeTab === key ? '#1a1200' : '#c6a84b',
                fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 20, minWidth: 18, textAlign: 'center',
              }}>{count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="empty-state"><span className="spinner light" style={{ width: 28, height: 28 }} /></div>
      ) : (
        <>
          {activeTab === 'friends'  && <FriendsTab  friends={data.friends} onMessage={openChat} />}
          {activeTab === 'sent'     && <SentTab     sent={data.sentRequests}     onCancel={handleCancel} />}
          {activeTab === 'received' && <ReceivedTab received={data.receivedRequests} onAccept={handleAccept} onReject={handleReject} />}
        </>
      )}

      {/* btn-gold style injection */}
      <style>{`
        .btn-gold {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 8px; border: none;
          background: linear-gradient(135deg, #c6a84b, #a8852e);
          color: #fff; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: opacity 0.2s;
        }
        .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-gold:hover:not(:disabled) { opacity: 0.88; }
      `}</style>
    </div>
  )
}
