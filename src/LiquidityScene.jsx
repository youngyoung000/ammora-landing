import { useEffect, useRef } from 'react'

const COLORS = {
  violet: [0.475, 0.22, 0.984],
  blue: [0.286, 0.788, 0.957],
  mint: [0.4, 0.953, 0.675],
}

const LIGHT_COLORS = {
  violet: [0.27, 0.06, 0.65],
  blue: [0.02, 0.34, 0.62],
  mint: [0.02, 0.42, 0.25],
}

const mixColor = (from, to, amount, alpha = 1) => [
  from[0] + (to[0] - from[0]) * amount,
  from[1] + (to[1] - from[1]) * amount,
  from[2] + (to[2] - from[2]) * amount,
  alpha,
]

const accentColor = (amount, alpha = 1, dark = true) => {
  const palette = dark ? COLORS : LIGHT_COLORS
  return amount < 0.52
    ? mixColor(palette.violet, palette.blue, amount / 0.52, alpha)
    : mixColor(palette.blue, palette.mint, (amount - 0.52) / 0.48, alpha)
}

const addSegment = (positions, colors, start, end, startColor, endColor = startColor) => {
  positions.push(...start, ...end)
  colors.push(...startColor, ...endColor)
}

function buildAlmmGeometry(dark) {
  const positions = []
  const colors = []
  const neutral = dark ? [0.82, 0.84, 0.88, 0.34] : [0.08, 0.09, 0.11, 0.46]
  const baseY = -0.78

  for (let x = -3.6; x <= 3.61; x += 0.6) {
    addSegment(positions, colors, [x, baseY, -2.35], [x, baseY, 2.35], neutral)
  }
  for (let z = -2.4; z <= 2.41; z += 0.6) {
    addSegment(positions, colors, [-3.55, baseY, z], [3.55, baseY, z], neutral)
  }

  const heights = [0.58, 0.84, 1.18, 1.62, 2.18, 1.62, 1.18, 0.84, 0.58]
  const radialSegments = 30
  heights.forEach((height, index) => {
    const x = -2.72 + index * 0.68
    const radius = 0.235
    const colorPosition = index / (heights.length - 1)
    const lineColor = accentColor(colorPosition, dark ? 0.78 : 0.94, dark)

    ;[0, 0.48, 1].forEach(level => {
      const y = baseY + height * level
      for (let segment = 0; segment < radialSegments; segment += 1) {
        const angleA = segment / radialSegments * Math.PI * 2
        const angleB = (segment + 1) / radialSegments * Math.PI * 2
        addSegment(
          positions,
          colors,
          [x + Math.cos(angleA) * radius, y, Math.sin(angleA) * radius],
          [x + Math.cos(angleB) * radius, y, Math.sin(angleB) * radius],
          lineColor,
        )
      }
    })

    for (let segment = 0; segment < 12; segment += 1) {
      const angle = segment / 12 * Math.PI * 2
      addSegment(
        positions,
        colors,
        [x + Math.cos(angle) * radius, baseY, Math.sin(angle) * radius],
        [x + Math.cos(angle) * radius, baseY + height, Math.sin(angle) * radius],
        lineColor,
      )
    }
  })

  const axisColor = dark ? [0.4, 0.953, 0.675, 0.78] : [0.08, 0.12, 0.13, 0.68]
  addSegment(positions, colors, [0, baseY, 0], [0, 2.75, 0], axisColor)
  addSegment(positions, colors, [0, 2.75, 0], [-0.11, 2.56, 0], axisColor)
  addSegment(positions, colors, [0, 2.75, 0], [0.11, 2.56, 0], axisColor)

  return { positions, colors }
}

const arlHeight = (x, z) => {
  const main = Math.exp(-(((x + 0.35) ** 2) / 3.8 + ((z - 0.05) ** 2) / 1.05))
  const shoulder = 0.32 * Math.exp(-(((x - 1.65) ** 2) / 5.4 + ((z + 0.45) ** 2) / 2.2))
  return -0.88 + main * 2.5 + shoulder
}

function buildArlGeometry(dark) {
  const positions = []
  const colors = []
  const xLines = 19
  const zLines = 15
  const samples = 54

  for (let xi = 0; xi < xLines; xi += 1) {
    const x = -3.35 + xi / (xLines - 1) * 6.7
    for (let sample = 0; sample < samples; sample += 1) {
      const zA = -2.3 + sample / samples * 4.6
      const zB = -2.3 + (sample + 1) / samples * 4.6
      const amount = (x + 3.35) / 6.7
      const alpha = dark ? 0.68 : 0.9
      addSegment(positions, colors, [x, arlHeight(x, zA), zA], [x, arlHeight(x, zB), zB], accentColor(amount, alpha, dark))
    }
  }

  for (let zi = 0; zi < zLines; zi += 1) {
    const z = -2.3 + zi / (zLines - 1) * 4.6
    for (let sample = 0; sample < samples; sample += 1) {
      const xA = -3.35 + sample / samples * 6.7
      const xB = -3.35 + (sample + 1) / samples * 6.7
      const amountA = (xA + 3.35) / 6.7
      const amountB = (xB + 3.35) / 6.7
      const alpha = dark ? 0.46 : 0.72
      addSegment(positions, colors, [xA, arlHeight(xA, z), z], [xB, arlHeight(xB, z), z], accentColor(amountA, alpha, dark), accentColor(amountB, alpha, dark))
    }
  }

  return { positions, colors }
}

function perspective(fieldOfView, aspect, near, far) {
  const f = 1 / Math.tan(fieldOfView / 2)
  const range = 1 / (near - far)
  return [
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (near + far) * range, -1,
    0, 0, near * far * range * 2, 0,
  ]
}

const normalize = ([x, y, z]) => {
  const length = Math.hypot(x, y, z) || 1
  return [x / length, y / length, z / length]
}

const cross = ([ax, ay, az], [bx, by, bz]) => [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]
const dot = ([ax, ay, az], [bx, by, bz]) => ax * bx + ay * by + az * bz

function lookAt(eye, target) {
  const zAxis = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]])
  const xAxis = normalize(cross([0, 1, 0], zAxis))
  const yAxis = cross(zAxis, xAxis)
  return [
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
  ]
}

function multiply(a, b) {
  const output = new Array(16).fill(0)
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      for (let index = 0; index < 4; index += 1) output[column * 4 + row] += a[index * 4 + row] * b[column * 4 + index]
    }
  }
  return output
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'Unable to compile liquidity shader')
  return shader
}

export default function LiquidityScene({ type, theme }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const gl = canvas?.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true })
    if (!canvas || !gl) return undefined

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, `
      attribute vec3 a_position;
      attribute vec4 a_color;
      uniform mat4 u_matrix;
      varying vec4 v_color;
      void main() {
        gl_Position = u_matrix * vec4(a_position, 1.0);
        v_color = a_color;
      }
    `)
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }
    `)
    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'Unable to link liquidity shader')

    const geometry = type === 'almm' ? buildAlmmGeometry(theme === 'dark') : buildArlGeometry(theme === 'dark')
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.positions), gl.STATIC_DRAW)
    const colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry.colors), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(program, 'a_position')
    const colorLocation = gl.getAttribLocation(program, 'a_color')
    const matrixLocation = gl.getUniformLocation(program, 'u_matrix')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const momentum = { x: 0, y: 0 }
    let lastPointer = null
    let animationFrame

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
    const handlePointerMove = (event) => {
      const bounds = canvas.getBoundingClientRect()
      target.x = clamp(((event.clientX - bounds.left) / bounds.width - 0.5) * 2, -1, 1)
      target.y = clamp(((event.clientY - bounds.top) / bounds.height - 0.5) * 2, -1, 1)
      if (lastPointer) {
        momentum.x = clamp(momentum.x + event.clientX - lastPointer.x, -24, 24)
        momentum.y = clamp(momentum.y + event.clientY - lastPointer.y, -24, 24)
      }
      lastPointer = { x: event.clientX, y: event.clientY }
    }
    const resetCamera = () => {
      target.x = 0
      target.y = 0
      lastPointer = null
    }

    const render = () => {
      const bounds = canvas.getBoundingClientRect()
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(1, Math.round(bounds.width * pixelRatio))
      const height = Math.max(1, Math.round(bounds.height * pixelRatio))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }

      if (!reduceMotion) {
        current.x += (target.x - current.x) * 0.07
        current.y += (target.y - current.y) * 0.07
        momentum.x *= 0.9
        momentum.y *= 0.9
      }

      const yaw = clamp(0.36 + current.x * 0.2 + momentum.x * 0.0018, 0.14, 0.58)
      const pitch = clamp(0.34 - current.y * 0.11 - momentum.y * 0.0012, 0.22, 0.46)
      const distance = type === 'almm' ? 8.7 : 8.9
      const targetY = type === 'almm' ? 0.48 : -0.02
      const camera = [
        Math.sin(yaw) * Math.cos(pitch) * distance,
        targetY + Math.sin(pitch) * distance,
        Math.cos(yaw) * Math.cos(pitch) * distance,
      ]
      const projection = perspective(Math.PI / 5.7, width / height, 0.1, 40)
      const view = lookAt(camera, [0, targetY, 0])

      gl.viewport(0, 0, width, height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.enable(gl.DEPTH_TEST)
      gl.depthFunc(gl.LEQUAL)
      gl.useProgram(program)
      gl.uniformMatrix4fv(matrixLocation, false, new Float32Array(multiply(projection, view)))

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      gl.enableVertexAttribArray(colorLocation)
      gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 0, 0)
      gl.drawArrays(gl.LINES, 0, geometry.positions.length / 3)

      animationFrame = window.requestAnimationFrame(render)
    }

    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerleave', resetCamera)
    animationFrame = window.requestAnimationFrame(render)

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerleave', resetCamera)
      window.cancelAnimationFrame(animationFrame)
      gl.deleteBuffer(positionBuffer)
      gl.deleteBuffer(colorBuffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [theme, type])

  return <canvas ref={canvasRef} className={`liquidity-graphic-new liquidity-webgl-new liquidity-webgl-${type}`} aria-hidden="true" />
}
