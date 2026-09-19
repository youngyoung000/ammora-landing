import { useMemo, useState } from 'react'
import AmmoraBrand from './components/AmmoraBrand.jsx'
import { Button, Container, Pill, ThemeRoot, useAmmoraTheme } from './design-system/index.jsx'

const wheelRewards = Array.from({ length: 10 }, (_, index) => (index + 1) * 10)

function ArrowIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4" /></svg>
}

function PointIcon() {
  return <svg viewBox="0 0 58 58" aria-hidden="true"><defs><linearGradient id="point-icon-gradient" x1="10" y1="8" x2="49" y2="51" gradientUnits="userSpaceOnUse"><stop stopColor="#7938fb"/><stop offset=".5" stopColor="#666dfb"/><stop offset="1" stopColor="#49c9f4"/></linearGradient></defs><path fill="url(#point-icon-gradient)" stroke="none" d="M32.7 7 16.8 31.2h10.7L24.8 51l16.4-25H30.4L32.7 7Z"/></svg>
}

function ActivityIcon({ type }) {
  const paths = {
    roulette: 'M10 3v2m0 10v2M3 10h2m10 0h2M5 5l1.5 1.5m7 7L15 15m0-10-1.5 1.5m-7 7L5 15M10 7l2 3-2 3-2-3 2-3Z',
    bridge: 'M3 9h14M5 9l5-5 5 5M5 9v6m10-6v6M3 15h14',
    swap: 'M4 6h11m-3-3 3 3-3 3M16 14H5m3 3-3-3 3-3',
    post: 'M5 15h10M7 13l6.5-6.5 1.5 1.5-6.5 6.5H7z',
  }
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d={paths[type]} /></svg>
}

function BoostActivity({ icon, title, copy, progress, reward, note, href, cta }) {
  return (
    <article className="boost-activity">
      <span className="boost-activity-icon"><ActivityIcon type={icon} /></span>
      <div className="boost-activity-copy">
        <div><h3>{title}</h3><strong>{progress}</strong></div>
        <p>{copy}</p>
        {note && <span>{note}</span>}
      </div>
      <div className="boost-activity-action">
        <b>{reward}</b>
        <a href={href}>{cta}<ArrowIcon /></a>
      </div>
    </article>
  )
}

export default function BoostPage() {
  const { theme, toggleTheme } = useAmmoraTheme('light')
  const [spinCount, setSpinCount] = useState(0)
  const [spinAngle, setSpinAngle] = useState(0)
  const [spinResult, setSpinResult] = useState(null)
  const [spinPhase, setSpinPhase] = useState('idle')
  const isSpinning = spinPhase !== 'idle'

  const siteBase = useMemo(() => window.location.hostname.endsWith('github.io') ? '/ammora-landing' : '', [])

  const spin = () => {
    if (spinCount >= 1 || isSpinning) return
    const rewardIndex = Math.floor(Math.random() * wheelRewards.length)
    const reward = wheelRewards[rewardIndex]
    const landingAngle = 360 - rewardIndex * 36
    const finalAngle = 1800 + landingAngle
    setSpinPhase('spinning')
    setSpinAngle(finalAngle + 9)
    window.setTimeout(() => {
      setSpinPhase('settling')
      setSpinAngle(finalAngle)
    }, 2200)
    window.setTimeout(() => {
      setSpinResult(reward)
      setSpinCount(1)
      setSpinPhase('idle')
    }, 2660)
  }

  return (
    <ThemeRoot className="boost-page" theme={theme}>
      <header className="boost-nav">
        <Container className="boost-nav-inner">
          <AmmoraBrand href={`${siteBase}/waitlist`} />
          <nav aria-label="Ammora Points navigation">
            <a href={`${siteBase}/waitlist`}>Overview</a>
            <a href={`${siteBase}/waitlist#missions`}>Missions</a>
            <a href={`${siteBase}/waitlist#leaderboard`}>Leaderboard</a>
            <a href={`${siteBase}/waitlist/boost`} aria-current="page">Boost</a>
          </nav>
          <div className="boost-nav-actions">
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}><i />{theme === 'dark' ? 'Light' : 'Dark'}</button>
            <Button size="sm" href={`${siteBase}/waitlist#entry`}>0x7A…20F9</Button>
          </div>
        </Container>
      </header>

      <main className="boost-main">
        <Container>
          <section className="boost-hero">
            <div className="boost-hero-copy">
              <Pill>Ammora Points</Pill>
              <h1>Boost your earnings.</h1>
              <p>Join special events and extra activities to earn more Ammora Points.</p>
            </div>
            <aside className="boost-account" aria-label="Your Ammora Points summary">
              <span className="boost-bolt"><PointIcon /></span>
              <div><small>Your Ammora Points</small><strong>200 <b>AP</b></strong></div>
              <i />
              <div><small>Your rank</small><strong>#1,248</strong><em>420 AP to Top 1,000</em></div>
            </aside>
          </section>

          <section className="boost-grid">
            <article id="roulette" className="roulette-panel">
              <div className="roulette-heading">
                <span>Daily boost</span>
                <h2>Spin the roulette.</h2>
                <p>Try your luck and win <strong>10–100 AP.</strong> Every result is fixed in 10-point increments.</p>
              </div>

              <div className="roulette-stage" data-phase={spinPhase} data-result={spinResult ? 'true' : 'false'}>
                <span className="roulette-lights" aria-hidden="true">{Array.from({ length: 20 }, (_, index) => <i key={index} style={{ '--light-index': index }} />)}</span>
                <span className="roulette-pointer" aria-hidden="true" />
                <div className="roulette-wheel" style={{ transform: `rotate(${spinAngle}deg)` }}>
                  {wheelRewards.map((reward, index) => <span className="roulette-label" key={reward} data-tier={reward >= 80 ? 'top' : reward >= 50 ? 'high' : 'base'} data-selected={spinResult === reward ? 'true' : 'false'} style={{ '--wheel-index': index }}><b>{reward}</b></span>)}
                  <i className="roulette-center" aria-hidden="true" />
                </div>
                <div className="roulette-spin-label" aria-hidden="true"><strong>{String(spinResult ?? 0).padStart(2, '0')}<small>AP</small></strong></div>
              </div>

              <div className="roulette-control">
                <span className="roulette-ticket" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 0 0-4V4H4v4Z" /></svg></span>
                <div><small>Remaining spins</small><strong>{1 - spinCount} <b>/ 1</b></strong><span>Resets every day at 00:00 UTC</span></div>
                <button type="button" onClick={spin} disabled={spinCount >= 1 || isSpinning}>{isSpinning ? 'Spinning…' : spinResult ? `Won +${spinResult} AP` : 'Spin now'}<ArrowIcon /></button>
              </div>
              <p className="roulette-footnote"><i>i</i> Rewards are added to your Ammora Points instantly.</p>
            </article>

            <aside className="boost-activities-panel">
              <div className="boost-activities-head"><h2>More boost activities</h2><p>Complete these activities to earn extra points during the event.</p></div>
              <div className="boost-activity-list">
                <BoostActivity icon="roulette" title="Roulette" progress={`${spinCount} / 1`} copy="Spin once per day for a guaranteed reward." note="Fixed in 10-point increments" reward="10–100 AP" href="#roulette" cta="Spin roulette" />
                <BoostActivity icon="bridge" title="Bridge" progress="0 / 1" copy="Bridge ETH to GIWA." note="Eligible direction · ETH → GIWA only" reward="+50 AP" href={`${siteBase}/#/bridge`} cta="Open Bridge" />
                <BoostActivity icon="swap" title="Swap" progress="0 / 10" copy="Swap ETH for any Ammora testnet token." note="Up to 10 verified swaps" reward="+10 AP each" href={`${siteBase}/#/swap`} cta="Go to Swap" />
              </div>

              <article className="yapping-card">
                <div className="yapping-top"><div><span>Weekly event</span><h2>Yapping Burning Event</h2></div><div className="yapping-reward"><em>0 / 1 this week</em><strong>+500 <small>AP</small></strong></div></div>
                <p>Share why you are bullish on Ammora or what you expect from the protocol.</p>
                <div className="yapping-topics"><small>Choose one topic</small><span>Why I’m bullish on Ammora</span><span>What I expect from Ammora</span></div>
                <div className="yapping-tags" aria-label="Required tags"><span>#Upbit</span><span>#GIWA</span><span>#Ammora</span></div>
                <div className="yapping-rules">
                  <span><i>01</i><b>One post per week</b></span>
                  <span><i>02</i><b>Existing daily-post Sybil tags apply</b></span>
                  <span><i>03</i><b>Human review · rewards paid in batch</b></span>
                </div>
                <a className="yapping-cta" href="https://x.com/intent/post?text=Why%20I%27m%20bullish%20on%20Ammora%20%23Upbit%20%23GIWA%20%23Ammora" target="_blank" rel="noreferrer">Create weekly post<ArrowIcon /></a>
              </article>
            </aside>
          </section>
        </Container>
      </main>

      <footer className="boost-footer"><Container><AmmoraBrand href={`${siteBase}/waitlist`}/><span>Extra activities · verified rewards</span><small>© 2026 Ammora Protocol</small></Container></footer>
    </ThemeRoot>
  )
}
