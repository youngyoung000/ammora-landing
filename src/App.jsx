import { useEffect, useRef, useState } from 'react'

const Arrow = ({ diagonal = false }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    {diagonal ? <path d="M5 15 15 5m-7 0h7v7" /> : <path d="M4 10h12m-4-4 4 4-4 4" />}
  </svg>
)

const Logo = () => (
  <a className="logo" href="#top" aria-label="Ammora home">
    <img src="/ammora-logo.png" alt="" />
  </a>
)

const Pill = ({ children, mint = false }) => (
  <span className={`pill${mint ? ' pill-mint' : ''}`}>{children}</span>
)

function HeroFluid() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      powerPreference: 'high-performance',
    })
    if (!gl) {
      canvas.dataset.fallback = 'true'
      return undefined
    }

    const vertexSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    const fragmentSource = `
      precision highp float;
      varying vec2 v_uv;
      uniform vec2 u_resolution;
      uniform vec2 u_pointer;
      uniform float u_time;

      float bell(float x, float center, float width) {
        float q = (x - center) / width;
        return exp(-q * q);
      }

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec2 uv = v_uv;
        float t = u_time;
        float x = uv.x;

        float ridge = 0.48;
        ridge += 0.050 * sin(x * 5.8 + t * 0.34);
        ridge += 0.032 * sin(x * 12.6 - t * 0.25);
        ridge += 0.016 * sin(x * 25.0 + t * 0.19);
        ridge += 0.150 * bell(x, 0.16 + 0.035 * sin(t * 0.23), 0.13);
        ridge += 0.205 * bell(x, 0.53 + 0.045 * sin(t * 0.18 + 1.7), 0.115);
        ridge += 0.175 * bell(x, 0.84 + 0.030 * sin(t * 0.21 + 3.2), 0.10);

        float pointerShape = bell(x, u_pointer.x, 0.115);
        float pointerShoulder = bell(x, u_pointer.x - 0.11, 0.19);
        float pointerTarget = clamp(u_pointer.y, 0.26, 0.80);
        ridge = mix(ridge, pointerTarget, pointerShape * 0.56);
        ridge += (u_pointer.x - 0.5) * 0.035 * pointerShoulder;

        float d = uv.y - ridge;
        float surface = smoothstep(0.16, -0.43, d);
        float violetBand = exp(-pow((d + 0.004) / 0.062, 2.0));
        float cyanBand = exp(-pow((d + 0.145) / 0.185, 2.0));
        float mintBand = exp(-pow((d - 0.052) / 0.088, 2.0));
        float deepBand = smoothstep(-0.10, -0.48, d);

        vec3 violet = vec3(0.475, 0.220, 0.984);
        vec3 indigo = vec3(0.400, 0.427, 0.984);
        vec3 cyan = vec3(0.286, 0.788, 0.957);
        vec3 mint = vec3(0.400, 0.953, 0.675);

        vec3 color = mix(violet, indigo, 0.43 + 0.18 * sin(x * 8.0 - t * 0.22));
        color = mix(color, violet, violetBand * 0.96);
        color = mix(color, cyan, cyanBand * 0.42);
        color = mix(color, mint, mintBand * 0.28);
        color = mix(color, violet * 0.74, deepBand * 0.38);

        vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
        vec2 lightDelta = (uv - u_pointer) * aspect;
        float cursorGlow = exp(-dot(lightDelta, lightDelta) * 8.5);
        float reflection = cursorGlow * exp(-pow((d - 0.012) / 0.055, 2.0));
        color = mix(color, vec3(1.0), reflection * 0.82);

        float halo = exp(-pow((d - 0.085) / 0.11, 2.0));
        float alpha = surface * 0.54 + violetBand * 0.48 + halo * 0.18;
        alpha += cursorGlow * 0.045;
        alpha *= smoothstep(0.02, 0.13, uv.y) * smoothstep(0.02, 0.12, 1.0 - uv.y);

        float grain = hash21(gl_FragCoord.xy + vec2(t * 43.0, -t * 31.0)) - 0.5;
        color += grain * 0.045;
        alpha = clamp(alpha + grain * 0.018, 0.0, 0.82);

        gl_FragColor = vec4(color, alpha);
      }
    `

    const compile = (type, source) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compile(gl.VERTEX_SHADER, vertexSource)
    const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource)
    if (!vertexShader || !fragmentShader) {
      canvas.dataset.fallback = 'true'
      return undefined
    }

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      canvas.dataset.fallback = 'true'
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      return undefined
    }

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const pointerLocation = gl.getUniformLocation(program, 'u_pointer')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const targetPointer = { x: 0.52, y: 0.55 }
    const currentPointer = { x: 0.52, y: 0.55 }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animationFrame
    let startTime = performance.now()

    const resize = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.max(1, Math.floor(bounds.width * pixelRatio))
      const height = Math.max(1, Math.floor(bounds.height * pixelRatio))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    const onPointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect()
      targetPointer.x = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
      targetPointer.y = 1 - Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height))
    }

    const draw = (now) => {
      resize()
      currentPointer.x += (targetPointer.x - currentPointer.x) * 0.075
      currentPointer.y += (targetPointer.y - currentPointer.y) * 0.075
      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform2f(pointerLocation, currentPointer.x, currentPointer.y)
      gl.uniform1f(timeLocation, reduceMotion ? 2.4 : (now - startTime) / 1000)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!reduceMotion) animationFrame = requestAnimationFrame(draw)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    animationFrame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero-fluid-canvas" />
}

const SectionHead = ({ eyebrow, title, copy, center = false }) => (
  <div className={`section-head${center ? ' section-head-center' : ''}`}>
    <span className="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    {copy && <p>{copy}</p>}
  </div>
)

const LineChart = () => (
  <svg className="line-chart" viewBox="0 0 680 250" preserveAspectRatio="none" aria-label="Illustrative market price and volume chart" role="img">
    <defs>
      <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#666dfb" stopOpacity=".25" />
        <stop offset="1" stopColor="#666dfb" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#7938fb" />
        <stop offset=".55" stopColor="#49c9f4" />
        <stop offset="1" stopColor="#66f3ac" />
      </linearGradient>
    </defs>
    <g className="chart-grid">
      <path d="M0 50H680M0 100H680M0 150H680M0 200H680" />
      <path d="M110 0V250M220 0V250M330 0V250M440 0V250M550 0V250" />
    </g>
    <path className="chart-fill" d="M0 206C41 194 62 202 96 174s56-24 84-6 50-63 82-52 45 41 74 22 39-59 75-56 45 54 77 38 31-73 65-67 38 58 68 40 43-52 69-46 42-41 70-46v249H0Z" />
    <path className="chart-line" d="M0 206C41 194 62 202 96 174s56-24 84-6 50-63 82-52 45 41 74 22 39-59 75-56 45 54 77 38 31-73 65-67 38 58 68 40 43-52 69-46 42-41 70-46" />
    <circle className="chart-point" cx="552" cy="53" r="5" />
  </svg>
)

const actionData = {
  trade: {
    label: 'Trade', title: 'Find a route through reviewed liquidity.',
    copy: 'Swap directly through an Ammora pool or compare supported routes through Ammora Aggregation. Quotes are tied to current onchain state and protected by user-defined slippage.',
    points: ['Direct ALMM and ARL swaps', 'Reviewed multi-hop routes', 'Quote and minimum-output protection'],
    visual: 'route', cta: 'Explore Markets',
  },
  liquidity: {
    label: 'Provide Liquidity', title: 'Place capital where the market can use it.',
    copy: 'Choose individual price bins with ALMM or a continuous price range with ARL. Each position records ownership, liquidity, and fee rights onchain.',
    points: ['Strategy-based ALMM positions', 'Managed ARL ranges', 'Add, remove, and claim liquidity'],
    visual: 'bins', cta: 'View Liquidity Models',
  },
  launch: {
    label: 'Launch', title: 'Start with price discovery, not an arbitrary listing price.',
    copy: 'Create a token market with predefined curve, fee, and migration rules. When the configured conditions are met, liquidity can move into an ARL market.',
    points: ['Onchain launch configuration', 'Transparent migration conditions', 'Long-term ARL destination'],
    visual: 'curve', cta: 'Explore ALC',
  },
  build: {
    label: 'Build', title: 'Integrate liquidity without rebuilding the protocol.',
    copy: 'The Ammora SDK helps applications read verified deployments, quote supported markets, validate execution conditions, prepare approvals, and build transactions.',
    points: ['Typed EVM SDK', 'Deployment and runtime verification', 'Data API integration'],
    visual: 'code', cta: 'Read the Developer Docs',
  },
}

function ActionVisual({ type }) {
  if (type === 'bins') return (
    <div className="bins-visual participant-visual" aria-hidden="true">
      <div className="participant-image-stage participant-image-stage--liquidity"><img src="/participant-liquidity.webp" alt="" loading="lazy" decoding="async" /></div>
      <div className="participant-legend liquidity-legend"><span>ALMM BINS</span><strong>ACTIVE RANGE</strong><span>POSITION NFT</span></div>
    </div>
  )
  if (type === 'curve') return (
    <div className="curve-visual participant-visual" aria-hidden="true">
      <div className="participant-image-stage participant-image-stage--cover"><img src="/participant-launch.webp" alt="" loading="lazy" decoding="async" /></div>
      <div className="participant-legend launch-legend"><span>DISCOVERY</span><strong>MIGRATION</strong><span>ARL MARKET</span></div>
    </div>
  )
  if (type === 'code') return (
    <div className="code-visual participant-visual" aria-label="Illustrative Ammora SDK code sample">
      <div className="code-top"><i/><i/><i/><span>quote.ts</span><b>SDK · VERIFIED</b></div>
      <div className="code-workspace">
        <pre><code><span className="code-row"><i>01</i><span><b>import</b> {'{ Ammora }'} <b>from</b> <em>'@ammora/sdk'</em></span></span><span className="code-row"><i>02</i><span /></span><span className="code-row"><i>03</i><span><b>const</b> quote = <b>await</b> ammora.<mark>quote</mark>({'{'})</span></span><span className="code-row"><i>04</i><span>  pool, amountIn, slippage</span></span><span className="code-row"><i>05</i><span>{'})'}</span></span><span className="code-row"><i>06</i><span /></span><span className="code-row"><i>07</i><span><b>return</b> quote.minAmountOut</span></span></code></pre>
        <div className="quote-result"><span>QUOTE RESULT</span><dl><div><dt>Route</dt><dd>Reviewed</dd></div><div><dt>Slippage</dt><dd>0.50%</dd></div><div><dt>Min. output</dt><dd>12,804.92</dd></div></dl><strong><i/>READY TO SIGN</strong></div>
      </div>
      <div className="participant-legend code-legend"><span>READ STATE</span><strong>BUILD TRANSACTION</strong><span>VALIDATE</span></div>
    </div>
  )
  return (
    <div className="route-visual participant-visual" aria-hidden="true">
      <div className="participant-image-stage"><img src="/participant-trade.webp" alt="" loading="lazy" decoding="async" /></div>
      <div className="participant-legend route-legend"><span>CURRENT STATE</span><strong>REVIEWED ROUTE</strong><span>QUOTE READY</span></div>
    </div>
  )
}

const models = [
  { code: 'ALMM', title: 'Precision at every price.', copy: 'Place liquidity across individual price bins.', tag: 'Bin-based', color: 'violet', features: ['Dynamic fee support', 'Position NFTs', 'Limit order infrastructure'] },
  { code: 'ARL', title: 'Put capital to work within a deliberate range.', copy: 'Choose where capital participates in trading.', tag: 'Range-based', color: 'blue', features: ['Managed ranges', 'LP fee claims', 'Compounding pool model'] },
  { code: 'ALC', title: 'Let the market discover its first price.', copy: 'Form an early market through a bonding curve.', tag: 'Curve-based', color: 'mint', features: ['Configurable rules', 'Buy & sell liquidity', 'Migration into ARL'] },
]

function ModelVisual({ code }) {
  if (code === 'ARL') return (
    <div className="model-visual model-range" aria-hidden="true">
      <svg className="liquidity-graphic" viewBox="0 0 360 180">
        <defs>
          <linearGradient id="arlArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#49c9f4" stopOpacity=".72"/><stop offset="1" stopColor="#666dfb" stopOpacity=".04"/></linearGradient>
          <linearGradient id="arlStroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#666dfb"/><stop offset=".55" stopColor="#49c9f4"/><stop offset="1" stopColor="#66f3ac"/></linearGradient>
          <filter id="arlGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path className="model-chart-grid" d="M28 36H332M28 72H332M28 108H332M28 144H332M78 24V150M130 24V150M182 24V150M234 24V150M286 24V150"/>
        <rect className="range-focus" x="78" y="24" width="212" height="120" rx="10"/>
        <path className="range-area" d="M78 144C99 142 115 134 130 119C149 99 160 64 180 47C193 35 210 39 224 55C244 77 250 115 290 144Z"/>
        <path className="range-profile" d="M78 144C99 142 115 134 130 119C149 99 160 64 180 47C193 35 210 39 224 55C244 77 250 115 290 144"/>
        <line className="range-boundary" x1="78" y1="27" x2="78" y2="148"/><line className="range-boundary" x1="290" y1="27" x2="290" y2="148"/>
        <line className="price-line" x1="202" y1="30" x2="202" y2="148"/>
        <circle className="price-halo" cx="202" cy="42" r="12"/><circle className="price-dot" cx="202" cy="42" r="5"/>
        <rect className="range-grip" x="72" y="78" width="12" height="30" rx="6"/><rect className="range-grip" x="284" y="78" width="12" height="30" rx="6"/>
      </svg>
      <div className="model-legend"><span><i/>MIN</span><strong>ACTIVE RANGE</strong><span>MAX<i/></span></div>
    </div>
  )
  if (code === 'ALC') return (
    <div className="model-visual model-curve" aria-hidden="true">
      <svg className="liquidity-graphic" viewBox="0 0 360 180">
        <defs>
          <linearGradient id="alcStroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#7938fb"/><stop offset=".56" stopColor="#49c9f4"/><stop offset="1" stopColor="#66f3ac"/></linearGradient>
          <linearGradient id="alcArea" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#7938fb" stopOpacity=".03"/><stop offset=".72" stopColor="#49c9f4" stopOpacity=".22"/><stop offset="1" stopColor="#66f3ac" stopOpacity=".36"/></linearGradient>
          <filter id="alcGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path className="model-chart-grid" d="M28 36H332M28 72H332M28 108H332M28 144H332M78 24V150M130 24V150M182 24V150M234 24V150M286 24V150"/>
        <path className="curve-area" d="M29 145C98 143 145 130 184 105C227 77 267 42 326 23V145Z"/>
        <path className="curve-profile" d="M29 145C98 143 145 130 184 105C227 77 267 42 326 23"/>
        <circle className="curve-particle p1" cx="72" cy="140" r="2"/><circle className="curve-particle p2" cx="116" cy="134" r="3"/><circle className="curve-particle p3" cx="158" cy="120" r="2.5"/>
        <line className="curve-checkpoint" x1="216" y1="24" x2="216" y2="144"/>
        <circle className="curve-halo" cx="216" cy="84" r="13"/><circle className="curve-dot" cx="216" cy="84" r="5"/>
        <circle className="migration-halo" cx="326" cy="23" r="12"/><circle className="migration-dot" cx="326" cy="23" r="4"/>
      </svg>
      <div className="model-legend curve-legend"><span>PRICE DISCOVERY</span><i>→</i><strong>MIGRATION · ARL</strong></div>
    </div>
  )
  const binHeights = [24, 34, 48, 66, 88, 116, 88, 66, 48, 34, 24]
  return (
    <div className="model-visual model-bins" aria-hidden="true">
      <svg className="liquidity-graphic" viewBox="0 0 360 180">
        <defs>
          <linearGradient id="almmBar" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#7938fb"/><stop offset=".62" stopColor="#666dfb"/><stop offset="1" stopColor="#49c9f4"/></linearGradient>
          <linearGradient id="almmActive" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#666dfb"/><stop offset=".55" stopColor="#49c9f4"/><stop offset="1" stopColor="#66f3ac"/></linearGradient>
          <filter id="almmGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <path className="model-chart-grid" d="M28 36H332M28 72H332M28 108H332M28 144H332M78 24V150M130 24V150M182 24V150M234 24V150M286 24V150"/>
        <path className="bin-depth-line" d="M43 120C83 112 112 91 145 57C160 40 168 28 178 28C188 28 196 40 211 57C244 91 273 112 313 120"/>
        {binHeights.map((height, index) => {
          const state = index === 5 ? 'bin-rect active current' : index >= 4 && index <= 6 ? 'bin-rect active' : 'bin-rect'
          return <rect key={height + index} className={state} x={34 + index * 27} y={144 - height} width="18" height={height} rx="5" />
        })}
        <line className="price-line" x1="178" y1="22" x2="178" y2="149"/>
        <circle className="price-halo" cx="178" cy="28" r="11"/><circle className="price-dot" cx="178" cy="28" r="5"/>
      </svg>
      <div className="model-legend"><span>INDIVIDUAL BINS</span><strong>ACTIVE PRICE</strong></div>
    </div>
  )
}

function FeeFlowIcon({ type }) {
  if (type === 'split') return (
    <div className="fee-icon fee-icon-split" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <defs><linearGradient id="feeSplitGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7938fb"/><stop offset=".52" stopColor="#49c9f4"/><stop offset="1" stopColor="#66f3ac"/></linearGradient></defs>
        <circle className="fee-icon-core" cx="32" cy="19" r="6"/>
        <path className="fee-branch" d="M32 25v7M32 32H17v10M32 32v10M32 32h15v10"/>
        <circle className="fee-share share-one" cx="17" cy="47" r="5"/><circle className="fee-share share-two" cx="32" cy="47" r="5"/><circle className="fee-share share-three" cx="47" cy="47" r="5"/>
      </svg>
    </div>
  )
  if (type === 'accrue') return (
    <div className="fee-icon fee-icon-accrue" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <defs><linearGradient id="feeAccrueGradient" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stopColor="#666dfb"/><stop offset=".55" stopColor="#49c9f4"/><stop offset="1" stopColor="#66f3ac"/></linearGradient></defs>
        <circle className="accrue-ring ring-outer" cx="32" cy="32" r="21"/><circle className="accrue-center" cx="32" cy="32" r="13"/>
        <path className="accrue-check" d="M27 32l4 4 7-9"/>
      </svg>
    </div>
  )
  return (
    <div className="fee-icon fee-icon-collect" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <defs><linearGradient id="feeCollectGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7938fb"/><stop offset=".58" stopColor="#666dfb"/><stop offset="1" stopColor="#49c9f4"/></linearGradient></defs>
        <circle className="collect-ring" cx="32" cy="32" r="21"/><circle className="collect-core" cx="32" cy="32" r="13"/>
        <text className="collect-symbol" x="32" y="38" textAnchor="middle">$</text>
      </svg>
    </div>
  )
}

const faqItems = [
  ['What is Ammora?', 'Ammora is an EVM liquidity protocol that connects market formation, programmable liquidity, swap execution, and fee distribution for token projects, LPs, traders, and applications.'],
  ['Is Ammora a launchpad?', 'Launching is one part of Ammora, not the entire product. ALC supports initial market formation, while ARL and ALMM support longer-term liquidity and trading.'],
  ['What is the difference between ALMM and ARL?', 'ALMM manages liquidity through individual price bins. ARL manages liquidity through a continuous price range, offering a simpler range-based model.'],
  ['How do trading fees work?', 'The trader pays the fee defined by the pool. The collected fee is then divided among LPs, the protocol, and any configured recipients.'],
  ['Is Ammora live on mainnet?', 'Ammora is currently available as a private beta on GIWA Sepolia. Mainnet availability will follow the required deployment, security, and operational release gates.'],
]

export default function App() {
  const [activeAction, setActiveAction] = useState('trade')
  const [openFaq, setOpenFaq] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  const action = actionData[activeAction]

  return (
    <div id="top" className="site-shell">
      <div className="global-aurora" aria-hidden="true" />
      <header className="site-header wrap">
        <Logo />
        <nav className={menuOpen ? 'nav-open' : ''} aria-label="Primary navigation">
          <a href="#protocol" onClick={() => setMenuOpen(false)}>Protocol</a>
          <a href="#liquidity" onClick={() => setMenuOpen(false)}>Liquidity</a>
          <a href="#developers" onClick={() => setMenuOpen(false)}>Developers</a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        </nav>
        <a href="#join" className="button button-small header-cta">Join the Beta <Arrow /></a>
        <button className="menu-button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span/><span/></button>
      </header>

      <main>
        <section className="hero wrap">
          <div className="hero-visual" aria-hidden="true">
            <HeroFluid />
            <div className="hero-fluid-veil" />
            <div className="hero-dot-field" />
            <div className="hero-grain" />
          </div>
          <div className="hero-copy">
            <div className="hero-meta"><span className="built-on">Built on <b>≋ GIWA</b></span></div>
            <h1>Markets need more than a token.<span>They need liquidity that can grow with them.</span></h1>
            <p>One system for market formation, programmable liquidity, swaps, and transparent fees.</p>
            <div className="hero-actions"><a className="button" href="#join">Join the Beta <Arrow /></a><a className="text-link" href="#protocol">See how it works <Arrow /></a></div>
          </div>
        </section>

        <section id="protocol" className="preview-section wrap section-pad">
          <SectionHead eyebrow="MARKET WORKSPACE" title="Launch a market. Grow it in one workspace." copy="Configure price discovery, monitor liquidity, and manage the market after migration." center />
          <div className="market-workspace-mockup">
            <div className="workspace-dual-stage">
              <figure className="workspace-view workspace-view-markets">
                <figcaption className="workspace-chip"><i />Markets</figcaption>
                <div className="workspace-image-frame"><img src="/landing-liquidity-ui-hd-transparent.webp" alt="Ammora markets workspace showing pool TVL, volume, fees, and APR" decoding="async" /></div>
              </figure>
              <figure className="workspace-view workspace-view-launchpad">
                <figcaption className="workspace-chip workspace-chip-launch"><i />Token Launchpad <em>Private Beta</em></figcaption>
                <div className="workspace-image-frame"><img src="/landing-eth-giwa-ui-4k-mockup-ratio.webp" alt="Ammora token launchpad for an ETH market on GIWA" decoding="async" /></div>
              </figure>
            </div>
            <div className="workspace-summary" aria-label="Ammora workspace capabilities"><span><i/>Launch <b>configured</b></span><span><i/>Discovery <b>onchain</b></span><span><i/>Liquidity <b>active</b></span><span><i/>Markets <b>connected</b></span></div>
          </div>
        </section>

        <section className="path-section section-pad">
          <div className="wrap">
            <SectionHead eyebrow="ONE CONNECTED PATH" title="From market formation to active liquidity." copy="Discover a price, grow liquidity, and open the market to users and apps." center />
            <div className="path-grid">
              <article><figure className="path-art"><img src="/path-market-formation-transparent.webp" alt="" loading="lazy" decoding="async" /></figure><h3>Form the market</h3><p>Use structured launch rules to let real demand establish an initial price.</p></article>
              <article><figure className="path-art"><img src="/path-liquidity-behavior-transparent.webp" alt="" loading="lazy" decoding="async" /></figure><h3>Choose how liquidity behaves</h3><p>Use price ranges or individual bins according to volatility, depth, and capital strategy.</p></article>
              <article><figure className="path-art"><img src="/path-open-access-transparent.webp" alt="" loading="lazy" decoding="async" /></figure><h3>Open access to the market</h3><p>Make liquidity available through swaps, reviewed routes, apps, and the Ammora SDK.</p></article>
            </div>
          </div>
        </section>

        <section className="actions-section wrap section-pad">
          <SectionHead eyebrow="BUILT FOR EVERY MARKET PARTICIPANT" title="What do you want liquidity to do?" />
          <div className="action-showcase">
            <div className="action-tabs" role="tablist" aria-label="Product actions">
              {Object.entries(actionData).map(([key, item]) => <button id={`action-tab-${key}`} aria-controls="action-panel" key={key} role="tab" aria-selected={activeAction===key} className={activeAction===key?'active':''} onClick={()=>setActiveAction(key)}>{item.label}</button>)}
            </div>
            <div id="action-panel" key={activeAction} className="action-content glass-panel" role="tabpanel" aria-labelledby={`action-tab-${activeAction}`}>
              <div className="action-copy"><h3>{action.title}</h3><p>{action.copy}</p><ul>{action.points.map(point=><li key={point}>{point}</li>)}</ul><a className="text-link" href="#liquidity">{action.cta} <Arrow /></a></div>
              <ActionVisual type={action.visual} />
            </div>
          </div>
        </section>

        <section id="liquidity" className="models-section section-pad">
          <div className="wrap"><SectionHead eyebrow="LIQUIDITY SYSTEM" title="Three liquidity models. One connected system." copy="A distinct model for every market stage." />
            <div className="model-grid">
              {models.map(model => <article className={`model-card model-${model.color}`} key={model.code}><div className="model-top"><span className="model-code">{model.code}</span><Pill>{model.tag}</Pill></div><ModelVisual code={model.code}/><h3>{model.title}</h3><p>{model.copy}</p><ul>{model.features.map(feature=><li key={feature}>{feature}</li>)}</ul></article>)}
            </div>
          </div>
        </section>

        <section id="fees" className="fees-section wrap section-pad">
          <div className="fees-copy"><SectionHead eyebrow="TRANSPARENT BY DESIGN" title="Fees move by rules, not assumptions." copy="One trading fee, divided by the pool's onchain configuration." /><div className="fee-example"><span>Example</span><strong>0.30%</strong><p>total trading fee</p><i>→</i><strong>10%</strong><p>of that fee to protocol</p></div><a className="text-link" href="#faq">Understand fee distribution <Arrow /></a></div>
          <div className="fee-flow glass-panel">
            <div className="flow-label"><span>TRADING FEE FLOW</span><b>Generated by a swap</b></div>
            <div className="flow-item"><FeeFlowIcon type="collect"/><div><strong>Collect</strong><p>A swap generates the configured trading fee.</p></div></div><div className="flow-line"/><div className="flow-item"><FeeFlowIcon type="split"/><div><strong>Split</strong><p>Onchain rules divide LP, protocol, and recipient shares.</p></div></div><div className="flow-line"/><div className="flow-item"><FeeFlowIcon type="accrue"/><div><strong>Accrue</strong><p>Eligible positions and recipients claim their balance.</p></div></div>
            <div className="afs-summary"><strong>AFS settlement</strong><p>Funded vault revenue is distributed by fixed shares. AFS does not create revenue.</p></div>
          </div>
        </section>

        <section className="proof-section section-pad">
          <div className="wrap"><SectionHead eyebrow="CLEAR EXECUTION" title="Onchain state. Clear outcomes." />
            <div className="proof-grid">
              {[
                ['Reviewed deployments','Contracts and runtime code resolve through reviewed profiles.','/clear-execution-reviewed.webp'],
                ['Receipt-based outcomes','Confirmed receipts determine what the product displays.','/clear-execution-receipt.webp'],
                ['Reorg-aware market data','Product state rebuilds from canonical onchain events.','/clear-execution-reorg.webp'],
                ['Explicit capability boundaries','Features follow the chain, pool model, and execution path.','/clear-execution-boundaries.webp']
              ].map(([t,c,image])=><article key={t}><div className="proof-visual"><img src={image} alt="" /></div><h3>{t}</h3><p>{c}</p></article>)}
            </div>
          </div>
        </section>

        <section className="vision-section wrap section-pad">
          <div className="vision-card">
            <div className="vision-copy"><Pill mint>THE LONG VIEW</Pill><h2>Liquidity for the assets coming onchain.</h2><p>Transparent markets and adaptable settlement liquidity for stablecoins and tokenized assets. Tokenization creates the asset. <strong>Liquidity makes the market usable.</strong></p></div>
            <div className="asset-orbit" aria-hidden="true"><div className="asset-center"><img src="/ammora-profile.webp" alt="" /></div><span className="asset a1">USD</span><span className="asset a2">BOND</span><span className="asset a3">RWA</span><span className="asset a4">CRYPTO</span><i className="asset-ring r1"/><i className="asset-ring r2"/></div>
          </div>
        </section>

        <section id="developers" className="dev-section section-pad">
          <div className="wrap dev-grid"><div><SectionHead eyebrow="DEVELOPERS" title="Build on Ammora." copy="Typed SDK and structured market data for wallets, apps, and routing systems." /><div className="transaction-flow"><div className="transaction-flow-head"><span>TRANSACTION FLOW</span></div><div className="transaction-plan" aria-label="SDK transaction planning sequence">{['Verify','Quote','Approve','Sign','Confirm'].map((step,index)=><span key={step}><i>{index+1}</i><b>{step}</b></span>)}</div></div><div className="dev-actions"><a className="button" href="#join">Read the Docs</a><a className="text-link" href="#join">View the SDK</a></div></div>
          <div className="capability-list">{[['Read verified state','Resolve reviewed deployments and pool state.'],['Quote before execution','Calculate output, approvals, and supported paths.'],['Build safer transactions','Validate provenance, slippage, and permissions.'],['Reconstruct market history','Read activity, portfolio, and fee metrics.']].map(([t,c])=><article key={t}><div><h3>{t}</h3><p>{c}</p></div></article>)}</div></div>
        </section>

        <section id="faq" className="faq-section wrap section-pad">
          <SectionHead eyebrow="FAQ" title="Straight answers about Ammora." />
          <div className="faq-list">{faqItems.map(([q,a],i)=><article className={openFaq===i?'open':''} key={q}><button onClick={()=>setOpenFaq(openFaq===i?-1:i)} aria-expanded={openFaq===i}><span>0{i+1}</span><strong>{q}</strong><i>{openFaq===i?'−':'+'}</i></button><div className="faq-answer"><p>{a}</p></div></article>)}</div>
        </section>

        <section id="join" className="final-cta wrap section-pad">
          <div className="cta-card"><div className="cta-glow"/><Pill mint>PRIVATE BETA · GIWA SEPOLIA</Pill><h2>Ready to build a market that lasts?</h2><p>Join the beta and help shape how onchain markets launch, trade, and grow.</p><div><a className="button" href="mailto:beta@ammora.xyz?subject=Ammora%20Private%20Beta">Join the Beta <Arrow /></a><a className="text-link" href="#developers">Read the Docs <Arrow diagonal /></a></div></div>
        </section>
      </main>

      <footer>
        <div className="wrap footer-grid"><div className="footer-brand"><Logo/><p>Programmable liquidity infrastructure<br/>for onchain markets.</p><Pill mint>● PRIVATE BETA</Pill></div>
          <div><h3>Product</h3><a href="#protocol">Protocol</a><a href="#liquidity">Liquidity</a><a href="#protocol">Markets</a><a href="#join">Join Beta</a></div>
          <div><h3>Developers</h3><a href="#developers">Documentation</a><a href="#developers">SDK</a><a href="#developers">GitHub ↗</a></div>
          <div><h3>Resources</h3><a href="#faq">FAQ</a><a href="#fees">Fee guide</a><a href="#join">Follow on X ↗</a></div>
        </div>
        <div className="wrap footer-bottom"><span>© 2026 Ammora Protocol</span><span>Private beta on GIWA Sepolia.</span><div><a href="#join">Privacy</a><a href="#join">Terms</a></div></div>
      </footer>
    </div>
  )
}
