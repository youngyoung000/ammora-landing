export default function AmmoraBrand({ href = '/', className = '' }) {
  return (
    <a className={`brand ${className}`.trim()} href={href} aria-label="Ammora home">
      <span className="brand-lockup">
        <img className="brand-lockup-base" src="/ammora-logo.png" alt="Ammora" />
        <img className="brand-lockup-color" src="/ammora-logo.png" alt="" aria-hidden="true" />
      </span>
    </a>
  )
}
