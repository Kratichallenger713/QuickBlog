import React, { useEffect, useRef, useState } from 'react'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import {
  LayoutDashboard,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react'

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

/** Get initials from a full name, e.g. "Kratika Bathav" → "KB" */
const getInitials = (name = '') => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

/* ─────────────────────────────────────────────
   Inline styles for the dropdown animation
   (avoids adding extra Tailwind plugin config)
───────────────────────────────────────────── */
const dropdownStyle = {
  position: 'absolute',
  top: 'calc(100% + 12px)',
  right: 0,
  width: '280px',
  background: '#ffffff',
  borderRadius: '16px',
  border: '1px solid #E5E7EB',
  boxShadow: '0 10px 40px -8px rgba(0,0,0,0.15), 0 4px 16px -4px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  transformOrigin: 'top right',
  zIndex: 50,
}

/* ─────────────────────────────────────────────
   Profile Dropdown
───────────────────────────────────────────── */
const ProfileDropdown = ({ user, logout, navigate, adminToken }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const name = user?.name || 'User'
  const initials = getInitials(name)

  const menuItems = [
    {
      label: 'My Blogs',
      icon: LayoutDashboard,
      action: () => { navigate('/myblogs'); setOpen(false) },
      color: '#4F46E5',
    },
    {
      label: 'Admin Panel',
      icon: Shield,
      action: () => { navigate('/admin'); setOpen(false) },
      color: '#4F46E5',
    },
    {
      label: 'Settings',
      icon: Settings,
      action: () => { setOpen(false) },
      color: '#4F46E5',
    },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px 6px 6px',
          borderRadius: '40px',
          border: '1.5px solid #E5E7EB',
          background: open ? '#F3F4F6' : '#fff',
          cursor: 'pointer',
          transition: 'background 0.2s, box-shadow 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(79,70,229,0.12)' : 'none',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#F9FAFB' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = open ? '#F3F4F6' : '#fff' }}
      >
        {/* Avatar */}
        {user?.image ? (
          <img
            src={user.image}
            alt={name}
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              letterSpacing: '0.5px',
            }}
          >
            {initials}
          </div>
        )}

        {/* Name */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#111827',
            maxWidth: 110,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          className="hidden sm:block"
        >
          {name}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={14}
          color="#6B7280"
          style={{
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        />
      </button>

      {/* ── Dropdown Panel ── */}
      <div
        role="menu"
        style={{
          ...dropdownStyle,
          opacity: open ? 1 : 0,
          transform: open ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.97)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 16px 14px',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'linear-gradient(to bottom, #FAFAFA, #fff)',
          }}
        >
          {/* Large avatar */}
          {user?.image ? (
            <img
              src={user.image}
              alt={name}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div
              style={{
                width: 44, height: 44,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                color: '#fff',
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
              }}
            >
              {initials}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {name}
            </p>
            <p style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 0', fontWeight: 500 }}>
              {user?.email || 'Member'}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div style={{ padding: '8px' }}>
          {menuItems.map(({ label, icon: Icon, action, color }) => (
            <button
              key={label}
              role="menuitem"
              onClick={action}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: 13.5,
                fontWeight: 500,
                color: '#374151',
                textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F3F4F6'
                e.currentTarget.style.color = color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#374151'
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: 1, background: '#F3F4F6', margin: '6px 4px' }} />

          {/* Logout */}
          <button
            role="menuitem"
            onClick={() => { logout(); setOpen(false) }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13.5,
              fontWeight: 500,
              color: '#EF4444',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEF2F2' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            <LogOut size={16} strokeWidth={2} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main Navbar
───────────────────────────────────────────── */
const Navbar = () => {
  const { navigate, token, user, logout, adminToken } = useAppContext()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #F3F4F6',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 32px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        {/* ── Logo ── */}
        <img
          onClick={() => navigate('/')}
          src={assets.logo}
          alt="QuickBlog"
          style={{ height: 32, width: 'auto', cursor: 'pointer', flexShrink: 0 }}
        />

        {/* ── Right section ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {token ? (
            <>
              {/* My Blogs nav pill */}
              <NavPill onClick={() => navigate('/myblogs')}>My Blogs</NavPill>

              {/* Add Blog nav pill */}
              <NavPill onClick={() => navigate('/addblog')}>Add Blog</NavPill>

              {/* Profile dropdown */}
              <div style={{ marginLeft: 8 }}>
                <ProfileDropdown
                  user={user}
                  logout={logout}
                  navigate={navigate}
                  adminToken={adminToken}
                />
              </div>
            </>
          ) : (
            <>
              {/* Login button for guests */}
              <button
                onClick={() => navigate('/login')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 24px',
                  borderRadius: 40,
                  border: 'none',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                  color: '#fff',
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s, transform 0.15s',
                  boxShadow: '0 2px 10px rgba(79,70,229,0.35)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Login
                <img src={assets.arrow} alt="" style={{ width: 12, filter: 'brightness(0) invert(1)' }} />
              </button>

              {/* Admin text link */}
              <button
                onClick={() => navigate('/admin')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 12,
                  color: '#9CA3AF',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: 3,
                  padding: '4px 6px',
                  borderRadius: 6,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#4F46E5' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
              >
                Admin
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

/* ─────────────────────────────────────────────
   Reusable nav pill button
───────────────────────────────────────────── */
const NavPill = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      padding: '7px 18px',
      borderRadius: 40,
      border: '1.5px solid #E5E7EB',
      background: '#fff',
      color: '#374151',
      fontSize: 13.5,
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'border-color 0.2s, color 0.2s, background 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#4F46E5'
      e.currentTarget.style.color = '#4F46E5'
      e.currentTarget.style.background = '#EEF2FF'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#E5E7EB'
      e.currentTarget.style.color = '#374151'
      e.currentTarget.style.background = '#fff'
    }}
  >
    {children}
  </button>
)

export default Navbar
