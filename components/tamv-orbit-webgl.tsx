"use client"

import { useEffect, useRef } from "react"

type Props = { activeNodeIndex: number }

const vertexShader = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  vec2 positions[3] = vec2[3](
    vec2(-1.0, -1.0),
    vec2(3.0, -1.0),
    vec2(-1.0, 3.0)
  );
  vec2 position = positions[gl_VertexID];
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform vec2 uResolution;
uniform vec2 uNodes[7];
uniform float uTime;
uniform int uActiveIndex;

float softRing(float distanceToRing, float width) {
  return 1.0 - smoothstep(0.0, width, abs(distanceToRing));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - vec2(0.5)) * vec2(aspect, 1.0);
  float radius = length(p);
  vec3 color = vec3(0.0);
  float alpha = 0.0;

  float outerOrbit = softRing(radius - 0.395, 0.0014) * 0.10;
  float middleOrbit = softRing(radius - 0.293, 0.0012) * 0.08;
  float innerOrbit = softRing(radius - 0.178, 0.0011) * 0.06;
  color += vec3(0.055, 0.40, 0.36) * outerOrbit;
  color += vec3(0.48, 0.31, 0.12) * middleOrbit;
  color += vec3(0.055, 0.40, 0.36) * innerOrbit;
  alpha += max(outerOrbit, max(middleOrbit, innerOrbit));

  float coreGlow = exp(-radius * 17.0) * 0.14;
  color += vec3(0.04, 0.58, 0.50) * coreGlow;
  alpha += coreGlow * 0.5;

  for (int i = 0; i < 7; i++) {
    vec2 nodeDelta = (vUv - uNodes[i]) * vec2(aspect, 1.0);
    float d = length(nodeDelta);
    float active = (i == uActiveIndex) ? 1.0 : 0.0;
    float breath = 0.5 + 0.5 * sin(uTime * 0.75 + float(i) * 0.83);
    float glow = exp(-d * 49.0) * (0.07 + active * 0.15 + breath * 0.035);
    float core = 1.0 - smoothstep(0.004, 0.012 + active * 0.004, d);
    float halo = 1.0 - smoothstep(0.008, 0.032 + active * 0.012, d);

    vec3 teal = vec3(0.035, 0.72, 0.62);
    vec3 gold = vec3(0.84, 0.62, 0.24);
    vec3 nodeColor = mix(teal, gold, active);
    color += nodeColor * (glow + core * (0.08 + active * 0.22));
    color += vec3(0.16, 0.22, 0.22) * halo * 0.09;
    alpha += max(glow, core * 0.18);
  }

  float vignette = smoothstep(0.76, 0.24, length((vUv - 0.5) * vec2(aspect, 1.0)));
  alpha *= vignette;
  outColor = vec4(color, clamp(alpha, 0.0, 0.62));
}
`;

const nodeCoordinates = new Float32Array([
  340 / 680, 1 - 78 / 550,
  495 / 680, 1 - 154 / 550,
  536 / 680, 1 - 314 / 550,
  438 / 680, 1 - 466 / 550,
  242 / 680, 1 - 466 / 550,
  144 / 680, 1 - 314 / 550,
  185 / 680, 1 - 154 / 550,
])

function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * Decorative GPU layer behind the accessible SVG atlas.
 * Falls back silently to SVG if WebGL2 is unavailable.
 * No telemetry or private data is read by this component.
 */
export function TamvOrbitWebGL({ activeNodeIndex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<() => void>(() => {})
  const activeNodeRef = useRef(activeNodeIndex)
  activeNodeRef.current = activeNodeIndex

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl2", { alpha: true, antialias: true, depth: false, stencil: false, premultipliedAlpha: true })
    if (!gl) {
      canvas.dataset.webgl = "unavailable"
      return
    }

    const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader)
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader)
    if (!vertex || !fragment) {
      if (vertex) gl.deleteShader(vertex)
      if (fragment) gl.deleteShader(fragment)
      canvas.dataset.webgl = "shader-error"
      return
    }

    const program = gl.createProgram()
    if (!program) {
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      canvas.dataset.webgl = "unavailable"
      return
    }
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    gl.deleteShader(vertex)
    gl.deleteShader(fragment)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      canvas.dataset.webgl = "shader-error"
      return
    }

    const resolutionLocation = gl.getUniformLocation(program, "uResolution")
    const nodeLocation = gl.getUniformLocation(program, "uNodes[0]")
    const timeLocation = gl.getUniformLocation(program, "uTime")
    const activeLocation = gl.getUniformLocation(program, "uActiveIndex")
    const vao = gl.createVertexArray()
    if (!vao || !resolutionLocation || !nodeLocation || !timeLocation || !activeLocation) {
      if (vao) gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      canvas.dataset.webgl = "unavailable"
      return
    }

    gl.bindVertexArray(vao)
    gl.useProgram(program)
    gl.uniform2fv(nodeLocation, nodeCoordinates)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    canvas.dataset.webgl = "ready"

    let animationFrame = 0
    let disposed = false
    let startedAt = performance.now()
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

    function draw(now: number) {
      if (disposed) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const width = Math.max(1, Math.round(rect.width * dpr))
      const height = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      gl.viewport(0, 0, width, height)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program)
      gl.bindVertexArray(vao)
      gl.uniform2f(resolutionLocation, width, height)
      gl.uniform1f(timeLocation, (now - startedAt) / 1000)
      gl.uniform1i(activeLocation, Math.max(0, Math.min(6, activeNodeRef.current)))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    drawRef.current = () => draw(performance.now())
    function animate(now: number) {
      draw(now)
      if (!disposed && !reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate)
    }
    function onMotionChange() {
      if (reducedMotion.matches) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = 0
        draw(performance.now())
      } else if (!animationFrame && !disposed) {
        animationFrame = window.requestAnimationFrame(animate)
      }
    }
    function onContextLost(event: Event) {
      event.preventDefault()
      window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      canvas.dataset.webgl = "context-lost"
    }
    function onContextRestored() {
      canvas.dataset.webgl = "restored"
      startedAt = performance.now()
      if (!reducedMotion.matches) {
        window.cancelAnimationFrame(animationFrame)
        animationFrame = window.requestAnimationFrame(animate)
      } else {
        draw(performance.now())
      }
    }

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => draw(performance.now())) : null
    if (resizeObserver) resizeObserver.observe(canvas)
    else window.addEventListener("resize", drawRef.current)
    canvas.addEventListener("webglcontextlost", onContextLost)
    canvas.addEventListener("webglcontextrestored", onContextRestored)
    reducedMotion.addEventListener("change", onMotionChange)
    draw(performance.now())
    if (!reducedMotion.matches) animationFrame = window.requestAnimationFrame(animate)

    return () => {
      disposed = true
      window.cancelAnimationFrame(animationFrame)
      resizeObserver?.disconnect()
      if (!resizeObserver) window.removeEventListener("resize", drawRef.current)
      canvas.removeEventListener("webglcontextlost", onContextLost)
      canvas.removeEventListener("webglcontextrestored", onContextRestored)
      reducedMotion.removeEventListener("change", onMotionChange)
      drawRef.current = () => {}
      gl.bindVertexArray(null)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
    }
  }, [])

  useEffect(() => {
    drawRef.current()
  }, [activeNodeIndex])

  return <canvas ref={canvasRef} className="sovereign-orbit-webgl" aria-hidden="true" data-webgl="pending" />
}
