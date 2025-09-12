// Simple button component to replace problematic hover handlers
import React from 'react'

interface HoverButtonProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: React.CSSProperties
  className?: string
}

const HoverButton: React.FC<HoverButtonProps> = ({
  href,
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  type = 'button',
  style = {},
  className = ''
}) => {
  const baseStyles: React.CSSProperties = {
    padding: '12px 24px',
    borderRadius: '20px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    fontWeight: '500',
    fontSize: '17px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-block',
    textAlign: 'center',
    ...style
  }

  const primaryStyles: React.CSSProperties = {
    backgroundColor: disabled ? '#8E8E93' : '#007AFF',
    color: 'white',
  }

  const secondaryStyles: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#007AFF',
    border: '1px solid #007AFF',
  }

  const finalStyles = {
    ...baseStyles,
    ...(variant === 'primary' ? primaryStyles : secondaryStyles)
  }

  const hoverClass = disabled ? '' : (variant === 'primary' ? 'btn-primary' : 'btn-secondary')

  if (href) {
    return (
      <a
        href={href}
        style={finalStyles}
        className={`${hoverClass} ${className}`}
      >
        {children}
      </a>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={finalStyles}
      className={`${hoverClass} ${className}`}
    >
      {children}
    </button>
  )
}

export default HoverButton
