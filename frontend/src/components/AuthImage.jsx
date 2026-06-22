import { useState, useEffect } from 'react'
import api from '../api/axiosInstance'

/**
 * Fetches an image through the axios instance (with JWT header),
 * converts it to an object URL, and renders it as <img>.
 *
 * Falls back to a placeholder on error.
 */
function AuthImage({ src, alt, className, style, placeholder }) {
  const [objectUrl, setObjectUrl] = useState(null)
  const [failed,    setFailed]    = useState(false)

  useEffect(() => {
    if (!src) return
    let revoked = false

    api.get(src, { responseType: 'blob', baseURL: '' })
      .then(({ data }) => {
        if (revoked) return
        setObjectUrl(URL.createObjectURL(data))
      })
      .catch(() => {
        if (!revoked) setFailed(true)
      })

    return () => {
      revoked = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  if (failed || (!objectUrl && !src)) {
    return placeholder ?? null
  }

  if (!objectUrl) {
    // still loading — show placeholder or nothing
    return placeholder ?? null
  }

  return <img src={objectUrl} alt={alt} className={className} style={style} />
}

export default AuthImage
