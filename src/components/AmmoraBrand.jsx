export default function AmmoraBrand({ href = '/', className = '' }) {
  const logoSrc = `${import.meta.env.BASE_URL}ammora-logo.png`
  return (
    <a className={`brand ${className}`.trim()} href={href} aria-label="Ammora home">
      <span className="brand-lockup">
        <img className="brand-lockup-base" src={logoSrc} alt="Ammora" />
        <img className="brand-lockup-color" src={logoSrc} alt="" aria-hidden="true" />
      </span>
    </a>
  )
}
