import { useEffect, useState } from 'react'

const joinClasses = (...classes) => classes.filter(Boolean).join(' ')

export function useAmmoraTheme(defaultTheme = 'dark') {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return defaultTheme
    const requestedTheme = new URLSearchParams(window.location.search).get('theme')
    if (requestedTheme === 'light' || requestedTheme === 'dark') return requestedTheme
    return window.localStorage.getItem('ammora-theme') || defaultTheme
  })

  useEffect(() => {
    window.localStorage.setItem('ammora-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark')
  return { theme, setTheme, toggleTheme }
}

export function ThemeRoot({ as: Element = 'div', theme = 'light', className, children, ...props }) {
  return <Element className={joinClasses('ds-theme', className)} data-theme={theme} {...props}>{children}</Element>
}

export function Container({ as: Element = 'div', className, children, ...props }) {
  return <Element className={joinClasses('ds-container', className)} {...props}>{children}</Element>
}

export function Section({ as: Element = 'section', className, children, ...props }) {
  return <Element className={joinClasses('ds-section', className)} {...props}>{children}</Element>
}

export function SectionHeader({ as: Element = 'div', title, description, align = 'left', className, headingAs: Heading = 'h2', children, ...props }) {
  return (
    <Element className={joinClasses('ds-section-header', className)} data-align={align} {...props}>
      {title && <Heading>{title}</Heading>}
      {description && <p>{description}</p>}
      {children}
    </Element>
  )
}

export function Button({ as: Element = 'a', variant = 'primary', size = 'md', className, children, ...props }) {
  return <Element className={joinClasses('ds-button', className)} data-variant={variant} data-size={size} {...props}>{children}</Element>
}

export function Pill({ as: Element = 'span', className, children, ...props }) {
  return <Element className={joinClasses('ds-pill', className)} {...props}>{children}</Element>
}

export function DividerGrid({ as: Element = 'div', columns = 2, className, style, children, ...props }) {
  return <Element className={joinClasses('ds-divider-grid', className)} style={{ gridTemplateColumns: `repeat(${columns},minmax(0,1fr))`, ...style }} {...props}>{children}</Element>
}

export function Tabs({ items, activeKey, onChange, label = 'Page sections', className }) {
  const isTabList = items.some(item => !item.href)
  return (
    <nav className={joinClasses('ds-tabs', className)} aria-label={label} role={isTabList ? 'tablist' : undefined}>
      {items.map(item => {
        if (item.href) return <a key={item.key} className="ds-tab" href={item.href} aria-current={activeKey === item.key ? 'page' : undefined}>{item.label}</a>
        return <button key={item.key} className="ds-tab" type="button" role="tab" aria-selected={activeKey === item.key} onClick={() => onChange?.(item.key)}>{item.label}</button>
      })}
    </nav>
  )
}
