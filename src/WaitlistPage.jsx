import { useState } from 'react'
import AmmoraBrand from './components/AmmoraBrand.jsx'
import { Button, Container, Pill, ThemeRoot, useAmmoraTheme } from './design-system/index.jsx'

const missions = [
  { key: 'follow', title: 'Follow @AmmoraHQ', copy: 'Follow the official Ammora account on X.', points: '+100 AP', frequency: 'Once', icon: 'x', completed: true, action: 'View', href: 'https://x.com/AmmoraHQ' },
  { key: 'retweet', title: 'Retweet the pinned post', copy: 'Help the opening campaign reach the next participant.', points: '+100 AP', frequency: 'Once', icon: 'repeat', action: 'Retweet', href: 'https://x.com/AmmoraHQ' },
  { key: 'email', title: 'Register your email', copy: 'Verify an email address for product and reward updates.', points: '+100 AP', frequency: 'Once', icon: 'mail', completed: true, action: 'Manage', href: 'mailto:beta@ammora.xyz?subject=Ammora%20Waitlist%20Email' },
]

const dailyMissions = [
  { key: 'post', title: 'Daily post', copy: 'Publish a valid Ammora post on X.', points: '+200 AP', frequency: 'Daily', icon: 'post', action: 'Post now', href: 'https://x.com/intent/post?text=Building%20the%20next%20market%20with%20%40AmmoraHQ' },
  { key: 'vault', title: 'Daily Vault transaction', copy: '', points: '+50 AP', frequency: 'Daily', icon: 'vault', action: 'Open Vault', href: '/#liquidity', secondaryAction: 'Faucet', secondaryHref: 'https://faucet.giwa.io', meta: 'Current Vault TVL · $48.62M' },
]

const launchWeekSteps = [
  { label: 'Follow', points: '+100', status: 'completed' },
  { label: 'Retweet', points: '+100', status: 'current' },
  { label: 'Email', points: '+100', status: 'completed' },
  { label: 'Post', points: '+200', status: 'upcoming' },
  { label: 'Vault TX', points: '+50', status: 'upcoming' },
]

const leaders = [
  ['01', '0x71A4…20F9', '8,940'],
  ['02', '0x8BC1…72E0', '8,420'],
  ['03', '0x29F0…A812', '7,980'],
  ['04', '0xF407…18B3', '7,710'],
  ['05', '0x90DE…C614', '7,460'],
  ['06', '0x4A19…D330', '7,220'],
  ['07', '0xA875…11F2', '6,940'],
  ['08', '0x3D82…90A1', '6,710'],
  ['09', '0xB190…E726', '6,540'],
  ['10', '0x62C4…8B15', '6,380'],
]

function MissionIcon({ type }) {
  if (type === 'x') return <span className="mission-letter" aria-hidden="true">X</span>
  const paths = {
    repeat: 'M5 7h9l-2.5-2.5M15 13H6l2.5 2.5M15 7l-2-2m-8 8 2 2',
    mail: 'M3.5 5.5h13v9h-13zM4 6l6 5 6-5',
    post: 'M4 15.5h12M6 13l7.5-7.5 1.5 1.5-7.5 7.5H6z',
    vault: 'M4 7h12v9H4zM3 7l7-4 7 4M7 10h6M7 13h3',
  }
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d={paths[type]} /></svg>
}

function MissionRow({ item, onOpenVault }) {
  const isVault = item.key === 'vault'
  return (
    <article className="mission-row" data-status={item.completed ? 'completed' : 'available'}>
      <span className="mission-icon">{item.completed ? <span className="mission-check" aria-label="Completed">✓</span> : <MissionIcon type={item.icon} />}</span>
      <div className="mission-copy"><div><h3>{item.title}</h3>{item.completed && <span className="mission-state">Completed</span>}</div>{item.copy && <p>{item.copy}</p>}{item.meta && <strong className="mission-meta">{item.meta}</strong>}</div>
      <span className="mission-frequency">{item.frequency}</span>
      <strong>{item.points}</strong>
      <div className="mission-actions">{item.secondaryAction && <a href={item.secondaryHref} target="_blank" rel="noreferrer" data-variant="secondary">{item.secondaryAction}</a>}{isVault ? <button type="button" onClick={onOpenVault}>{item.action}</button> : <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel={item.href.startsWith('http') ? 'noreferrer' : undefined}>{item.action}</a>}</div>
    </article>
  )
}

function VaultModal({ step, amount, onAmountChange, onClose, onOpen, onSign }) {
  if (!step) return null
  return (
    <div className="vault-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="vault-modal" role="dialog" aria-modal="true" aria-labelledby="vault-modal-title">
        <button className="vault-modal-close" type="button" onClick={onClose} aria-label="Close Vault modal">×</button>
        {step === 'amount' && <><div className="vault-modal-heading"><Pill>GIWA Sepolia Vault</Pill><h2 id="vault-modal-title">Open Vault position</h2></div><div className="vault-amount-field"><span className="vault-pay-head"><label htmlFor="vault-amount">You pay</label><small>Balance 6.842 ETH</small></span><span className="vault-pay-row"><input id="vault-amount" value={amount} onChange={event => onAmountChange(event.target.value)} inputMode="decimal" placeholder="0" aria-label="Vault amount"/><button className="vault-token-select" type="button"><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m12 3-5 9 5 3 5-3-5-9Zm-5 10 5 8 5-8-5 3-5-3Z"/></svg></i><strong>ETH</strong><svg className="vault-token-chevron" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 6 5 5 5-5"/></svg></button></span></div><div className="vault-modal-tvl"><strong>Current Vault TVL · $48.62M</strong></div><button className="vault-modal-primary" type="button" onClick={onOpen} disabled={!amount || Number(amount) <= 0}>Open position <span>→</span></button></>}
        {step === 'sign' && <><Pill>Wallet signature</Pill><div className="signature-mark" aria-hidden="true"><i/><i/><i/></div><h2 id="vault-modal-title">Confirm in your wallet.</h2><p>Review the Vault transaction and sign to complete today’s mission.</p><div className="vault-sign-summary"><span>Supply amount</span><strong>{amount || '0'} ETH</strong><span>Network</span><strong>GIWA Sepolia</strong></div><button className="vault-modal-primary" type="button" onClick={onSign}>Sign transaction</button></>}
        {step === 'complete' && <><Pill>Mission complete</Pill><div className="vault-success-mark" aria-hidden="true">✓</div><h2 id="vault-modal-title">+50 AP earned.</h2><p>Your Vault transaction was verified and today’s mission is complete.</p><div className="vault-complete-stats"><div><span>Points earned</span><strong>+50 AP</strong></div><div><span>Current Vault TVL</span><strong>$48.63M</strong></div></div><button className="vault-modal-primary" type="button" onClick={onClose}>Done</button></>}
      </section>
    </div>
  )
}

export default function WaitlistPage() {
  const { theme, toggleTheme } = useAmmoraTheme('light')
  const [activeTab, setActiveTab] = useState('tasks')
  const [vaultStep, setVaultStep] = useState(null)
  const [vaultAmount, setVaultAmount] = useState('')

  return (
    <ThemeRoot className="waitlist-page" theme={theme}>
      <header className="waitlist-nav">
        <Container className="waitlist-nav-inner">
          <AmmoraBrand />
          <nav aria-label="Waitlist navigation"><a href="/">Overview</a><a href="#missions">Missions</a><a href="#leaderboard">Leaderboard</a></nav>
          <div className="waitlist-nav-actions">
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}><i />{theme === 'dark' ? 'Light' : 'Dark'}</button>
            <Button size="sm" href="#entry">0x7A…20F9</Button>
          </div>
        </Container>
      </header>

      <main className="waitlist-main">
        <Container className="waitlist-workspace">
          <section id="missions" className="waitlist-task-column">
              <div className="waitlist-column-title"><Pill>Ammora Points</Pill><h1>Earn Ammora Points.</h1><div className="points-tabs" role="tablist" aria-label="Points program"><button type="button" role="tab" aria-selected={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')}>Tasks</button><button type="button" role="tab" aria-selected={activeTab === 'referral'} onClick={() => setActiveTab('referral')}>Referral <strong>+200 AP</strong></button></div></div>

              {activeTab === 'tasks' ? <div className="tab-panel" role="tabpanel">
              <div className="task-summary">
                <div className="points-summary"><span>Your Ammora Points</span><strong>200 <small>AP</small></strong></div>
                <div className="launch-progress">
                  <div className="launch-progress-head"><div><span>Bonus progress</span><h2>Launch Week completion</h2></div><strong>2 <small>/ 5</small></strong></div>
                  <div className="launch-step-grid" aria-label="Launch Week mission progress">
                    {launchWeekSteps.map((step, index) => <article key={step.label} className="launch-step-card" data-status={step.status}>
                      <span className="launch-step-index">{step.status === 'completed' ? '✓' : index + 1}</span>
                      <strong>{step.label}</strong>
                      <small>{step.status === 'completed' ? 'Completed' : step.status === 'current' ? 'Next task' : `${step.points} AP`}</small>
                    </article>)}
                  </div>
                  <div className="launch-bonus-note"><span>Complete all five once</span><strong>+1,000 AP</strong></div>
                </div>
              </div>

              <article id="entry" className="entry-gate">
                <span className="entry-index">01</span>
                <div><small>Required entry</small><h3>Connect Wallet + X</h3><p>Verify wallet and X account ownership to unlock missions.</p></div>
                <div className="entry-actions"><button type="button" disabled>Wallet ✓</button><button type="button" disabled>X ✓</button></div>
              </article>

              <div className="mission-group"><div className="mission-group-head"><h3>Main missions</h3><span>Complete once</span></div>{missions.map(item => <MissionRow key={item.key} item={item}/>)}</div>
              <div className="mission-group"><div className="mission-group-head"><h3>Daily missions</h3><span>Reset every day</span></div>{dailyMissions.map(item => <MissionRow key={item.key} item={item} onOpenVault={() => setVaultStep('amount')}/>)}</div>

              <article className="completion-bonus">
                <div className="bonus-heading"><div><Pill>Launch Week bonus</Pill><h3>Complete all five once.</h3></div><strong>+1,000 <small>AP</small></strong></div>
                <p>Finish every main and daily mission during Launch Week to unlock the one-time bonus.</p>
                <div className="bonus-sequence">{['Follow','Retweet','Email','Post','Vault TX'].map((label,index) => <span key={label}><i>{index + 1}</i>{label}</span>)}</div>
              </article>
              </div> : <div className="referral-tab-panel tab-panel" role="tabpanel">
              <div className="referral-stats"><div><span>Referral points earned</span><strong>600 <small>AP</small></strong></div><div><span>Qualified referrals</span><strong>3</strong></div></div>
            <section id="policy" className="referral-card">
              <div className="referral-heading"><div><Pill>Qualified referral</Pill><h2>Invite people who participate.</h2></div><strong>+200 <small>AP</small></strong></div>
              <p>Earn points when your invitee becomes a qualified participant.</p>
              <div className="referral-steps"><span><i>1</i>Connect Wallet + X</span><span><i>2</i>Complete all five missions once</span></div>
              <div className="referral-field"><span>ammora.xyz/waitlist?ref=0x71A4</span><button type="button">Copy</button></div>
            </section>
            <section className="referral-history"><div className="referral-history-head"><h3>Qualified referrals</h3><span>AP earned</span></div>{[['0x8BC1…72E0','+200 AP'],['0x29F0…A812','+200 AP'],['0xF407…18B3','+200 AP']].map(([address,points],index) => <div key={address}><span><i>{index + 1}</i>{address}</span><strong>{points}</strong></div>)}</section>
              </div>}
          </section>

          <aside id="leaderboard" className="waitlist-leaderboard-column">
              <section className="rank-panel">
                <Pill>Leaderboard</Pill>
                <div className="rank-overview"><div><span>Your rank</span><strong>#1,248</strong></div><div className="rank-progress"><div><span>Current points</span><strong>200 AP</strong></div><i><b/></i><span>420 AP to Top 1,000</span></div></div>
              </section>

              <section className="final-reward" aria-label="Final reward"><div><small>Guaranteed</small><strong>Top 1,000</strong></div><div><small>Random draw</small><strong>100 users</strong></div></section>

              <div className="leaderboard-grid">
                <article className="leaderboard-panel">
                  <div className="leaderboard-head"><span>Rank</span><span>Participant</span><span>AP</span></div>
                  {leaders.map(([rank,address,points]) => <div className="leader-row" key={rank}><b>{rank}</b><span><i>{address.slice(2,4)}</i>{address}</span><strong>{points}</strong></div>)}
                </article>
              </div>
          </aside>
        </Container>
      </main>

      <VaultModal step={vaultStep} amount={vaultAmount} onAmountChange={setVaultAmount} onClose={() => setVaultStep(null)} onOpen={() => setVaultStep('sign')} onSign={() => setVaultStep('complete')} />

      <footer className="waitlist-footer"><Container><AmmoraBrand/><span>Long-running waitlist · opening growth burst</span><small>© 2026 Ammora Protocol</small></Container></footer>
    </ThemeRoot>
  )
}
