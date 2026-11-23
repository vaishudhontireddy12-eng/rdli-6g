import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type DrawPaperContent = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => void;

export interface ThreeDPaperProps {
  className?: string;
  drawContent: DrawPaperContent;
  fontLoads?: string[];
  rimColor?: number;
  rimIntensity?: number;
  touchLightColor?: number;
  isActive?: boolean;
  enableDragTurn?: boolean;
  heightFill?: number;
  widthFill?: number;
  onPaperPointerDown?: (hitPaper: boolean) => void;
  onPaperDragStateChange?: (dragging: boolean) => void;
}

// Original ThreeUI 3D Paper geometry & shader constants
const SW = 2.3;
const SH = 2.72;
// Authoring grid matched 1:1 to SW/SH (2.30 / 2.72 = 0.845588) for crisp unstretched typography
export const PAPER_AUTHOR_W = 1200;
export const PAPER_AUTHOR_H = 1420;
const CW = 1690;
const CH = 2000;

const WAVE = `
uniform float uTime, uAmp, uFlutter, uPhase, uFreq, uTwist;
uniform vec2  uSize;

// the sheet hangs: it curls harder at the top than along the bottom edge
float sAmp(float u, float v){ return uAmp*(0.10 + pow(u,1.35))*(0.50 + 0.64*v); }
float sAmpV(float u){        return uAmp*(0.10 + pow(u,1.35))*0.64; }

float sTheta(float u, float v){
  float a  = sAmp(u,v);
  float ph = uFreq*u + uTwist*v + uTime*0.40 + uPhase;
  return a*sin(ph) + uFlutter*a*0.60*sin(ph*2.35 + uTime*2.0);
}
float sThetaV(float u, float v){
  float a  = sAmp(u,v), da = sAmpV(u);
  float ph = uFreq*u + uTwist*v + uTime*0.40 + uPhase;
  float f  = ph*2.35 + uTime*2.0;
  return da*sin(ph) + a*cos(ph)*uTwist
       + uFlutter*0.60*(da*sin(f) + a*cos(f)*uTwist*2.35);
}
float sYoff(float u, float v){
  float w = 1.0 - 0.55*v;
  return 0.021*uSize.y*sin(2.05*u + uTime*0.47 + uPhase)
       + 0.013*uSize.y*sin(3.35*u - 1.55*v + uTime*0.63 + uPhase)*w;
}
float sYdU(float u, float v){
  float w = 1.0 - 0.55*v;
  return 0.0431*uSize.y*cos(2.05*u + uTime*0.47 + uPhase)
       + 0.0436*uSize.y*cos(3.35*u - 1.55*v + uTime*0.63 + uPhase)*w;
}
float sYdV(float u, float v){
  float ph = 3.35*u - 1.55*v + uTime*0.63 + uPhase;
  return 0.013*uSize.y*(-1.55*cos(ph)*(1.0-0.55*v) - 0.55*sin(ph));
}

// paper conserves arc length: integrate the bend instead of pushing Z,
// so the silhouette really pulls in where the sheet turns away
void sheetPoint(vec2 q, out vec3 P, out vec3 NN){
  float u = q.x, v = q.y;
  float x=0.0, z=0.0, xe=0.0, ze=0.0, dxv=0.0, dzv=0.0, dxe=0.0, dze=0.0;
  const int NS = 20;
  float h = 1.0/float(NS);
  for(int i=0;i<NS;i++){
    float uu = (float(i)+0.5)*h;
    float w  = clamp((u-(uu-0.5*h))/h, 0.0, 1.0);
    float th = sTheta(uu,v);
    float dt = sThetaV(uu,v);
    float c = cos(th), sn = sin(th);
    xe += c*h;          ze += sn*h;
    dxe += -sn*dt*h;    dze +=  c*dt*h;
    x   += c*h*w;       z   += sn*h*w;
    dxv += -sn*dt*h*w;  dzv +=  c*dt*h*w;
  }
  float W = uSize.x, H = uSize.y;
  float th0 = sTheta(u,v);
  P = vec3((x - xe*0.5)*W, (v-0.5)*H + sYoff(u,v), (z - ze*0.5)*W);
  vec3 Tu = vec3(W*cos(th0), sYdU(u,v), W*sin(th0));
  vec3 Tv = vec3((dxv - dxe*0.5)*W, H + sYdV(u,v), (dzv - dze*0.5)*W);
  NN = normalize(cross(Tu, Tv));
}`;

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s >>> 8) / 8388608;
  };
};

export function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function detectSoftwareGl(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

export function ThreeDPaper({
  className = '',
  drawContent,
  fontLoads = [],
  rimColor = 0x7fd0ff,
  rimIntensity = 0.3,
  touchLightColor = 0xbfe8ff,
  isActive = true,
  enableDragTurn = true,
  heightFill = 0.78,
  widthFill = 0.88,
  onPaperPointerDown,
  onPaperDragStateChange,
}: ThreeDPaperProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const grain2Ref = useRef<HTMLDivElement>(null);

  const drawContentRef = useRef(drawContent);
  drawContentRef.current = drawContent;

  const isActiveRef = useRef(isActive);
  isActiveRef.current = isActive;

  const enableDragTurnRef = useRef(enableDragTurn);
  enableDragTurnRef.current = enableDragTurn;

  const resumeLoopRef = useRef<(() => void) | null>(null);

  const onPaperPointerDownRef = useRef(onPaperPointerDown);
  onPaperPointerDownRef.current = onPaperPointerDown;

  const onPaperDragStateChangeRef = useRef(onPaperDragStateChange);
  onPaperDragStateChangeRef.current = onPaperDragStateChange;

  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (isActive) {
      resumeLoopRef.current?.();
    }
  }, [isActive]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const isSoftwareGl = detectSoftwareGl();

    // Film grain (exact ThreeUI procedural grain)
    (() => {
      const n = 160;
      const c = document.createElement('canvas');
      c.width = c.height = n;
      const x = c.getContext('2d');
      if (!x) return;
      const d = x.createImageData(n, n);
      for (let i = 0; i < n * n; i++) {
        const v = 128 + (Math.random() - 0.5) * 168;
        d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v;
        d.data[i * 4 + 3] = 255;
      }
      x.putImageData(d, 0, 0);
      const url = `url(${c.toDataURL()})`;
      if (grainRef.current) grainRef.current.style.backgroundImage = url;
      if (grain2Ref.current) grain2Ref.current.style.backgroundImage = url;
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
    camera.position.set(0, 0, 8.2);

    // Light-studio environment reflection for bright white-pearl physical paper
    const envCanvasTex = (() => {
      const w = 1024;
      const h = 512;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const x = c.getContext('2d')!;
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.5, '#dbeafe');
      g.addColorStop(1, '#bae6fd');
      x.fillStyle = g;
      x.fillRect(0, 0, w, h);

      const blob = (
        cx: number,
        cy: number,
        rx: number,
        ry: number,
        col: string,
        a: string,
      ) => {
        const rg = x.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        rg.addColorStop(0, col.replace('A', a));
        rg.addColorStop(1, col.replace('A', '0'));
        x.save();
        x.translate(cx, cy);
        x.scale(1, ry / rx);
        x.translate(-cx, -cy);
        x.fillStyle = rg;
        x.beginPath();
        x.arc(cx, cy, rx, 0, 7);
        x.fill();
        x.restore();
      };
      blob(w * 0.3, h * 0.24, 330, 240, 'rgba(255,255,255,A)', '1');
      blob(w * 0.74, h * 0.34, 240, 200, 'rgba(186,230,253,A)', '.55');
      blob(w * 0.52, h * 0.86, 420, 190, 'rgba(224,242,254,A)', '.35');

      const t = new THREE.CanvasTexture(c);
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.encoding = THREE.sRGBEncoding;
      return t;
    })();

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envRT = pmrem.fromEquirectangular(envCanvasTex);
    scene.environment = envRT.texture;
    envCanvasTex.dispose();
    pmrem.dispose();

    const key = new THREE.DirectionalLight(0xffffff, 0.72);
    key.position.set(-2.4, 2.0, 3.0);
    const fill = new THREE.DirectionalLight(0xdbeafe, 0.28);
    fill.position.set(3.6, -1.8, 1.8);
    const rim = new THREE.DirectionalLight(0xffffff, 0.18);
    rim.position.set(1.6, 1.2, -2.6);
    const ambient = new THREE.AmbientLight(0xffffff, 0.42);
    scene.add(key, fill, rim, ambient);

    const touchLight = new THREE.PointLight(touchLightColor, 0, 7.5, 1.35);
    touchLight.position.set(0, 0, 1.7);
    scene.add(touchLight);

    // Smooth blobby film thickness map (from ThreeUI 3D Paper)
    const thicknessMap = (() => {
      const n = 256;
      const c = document.createElement('canvas');
      c.width = c.height = n;
      const x = c.getContext('2d')!;
      x.fillStyle = '#000';
      x.fillRect(0, 0, n, n);
      const rnd = rng(9173);
      for (let oct = 0; oct < 3; oct++) {
        const count = 6 * (oct + 1) * (oct + 1);
        const r = n / (2.2 + oct * 2.1);
        const a = 0.42 / (oct + 1);
        for (let i = 0; i < count; i++) {
          const px = rnd() * n;
          const py = rnd() * n;
          const g = x.createRadialGradient(px, py, 0, px, py, r);
          g.addColorStop(0, `rgba(0,255,0,${a})`);
          g.addColorStop(1, 'rgba(0,255,0,0)');
          x.fillStyle = g;
          x.fillRect(px - r, py - r, 2 * r, 2 * r);
        }
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(1.6, 2.1);
      return t;
    })();

    const maxAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy() || 4);

    const buildPaperTexture = () => {
      const c = document.createElement('canvas');
      c.width = CW;
      c.height = CH;
      const ctx = c.getContext('2d')!;
      ctx.clearRect(0, 0, CW, CH);
      ctx.save();
      ctx.scale(CW / PAPER_AUTHOR_W, CH / PAPER_AUTHOR_H);
      roundedRectPath(ctx, 0, 0, PAPER_AUTHOR_W, PAPER_AUTHOR_H, 26);
      ctx.clip();
      drawContentRef.current(ctx, PAPER_AUTHOR_W, PAPER_AUTHOR_H);
      ctx.restore();
      const t = new THREE.CanvasTexture(c);
      t.encoding = THREE.sRGBEncoding;
      t.anisotropy = maxAnisotropy;
      t.needsUpdate = true;
      return t;
    };

    const geo = new THREE.PlaneGeometry(SW, SH, 72, 96);

    const uni = {
      uTime: { value: 0 },
      uAmp: { value: 1.18 },
      uFreq: { value: 4.7 },
      uTwist: { value: 1.3 },
      uSize: { value: new THREE.Vector2(SW, SH) },
      uFlutter: { value: 0 },
      uPhase: { value: 0 },
      uRim: { value: rimIntensity },
      uRimA: { value: 0.0 },
      uSpecA: { value: 0.0 },
      uRimCol: { value: new THREE.Color(rimColor) },
    };

    let currentTex = buildPaperTexture();

    const mat = new THREE.MeshPhysicalMaterial({
      map: currentTex,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: currentTex,
      emissiveIntensity: 0.22,
      color: new THREE.Color(0xffffff),
      side: THREE.DoubleSide,
      metalness: 0.0,
      roughness: 0.36,
      clearcoat: 0.4,
      clearcoatRoughness: 0.25,
      sheen: 0.12,
      sheenRoughness: 0.85,
      sheenColor: new THREE.Color(0xe0f2fe),
      iridescence: 0.26,
      iridescenceIOR: 1.48,
      iridescenceThicknessRange: [180, 620],
      iridescenceThicknessMap: thicknessMap,
      envMapIntensity: 0.28,
      specularIntensity: 0.42,
      transparent: true,
      alphaTest: 0.42,
      opacity: 1,
    } as THREE.MeshPhysicalMaterialParameters);

    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, uni);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', `#include <common>\n${WAVE}`)
        .replace(
          '#include <beginnormal_vertex>',
          `
      vec3 sheetP; vec3 objectNormal;
      sheetPoint(uv, sheetP, objectNormal);
      #ifdef USE_TANGENT
        vec3 objectTangent = vec3( tangent.xyz );
      #endif
    `,
        )
        .replace('#include <begin_vertex>', 'vec3 transformed = sheetP;');

      sh.fragmentShader = sh.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nuniform float uRim, uRimA, uSpecA;\nuniform vec3 uRimCol;',
        )
        .replace(
          '#include <alphatest_fragment>',
          'if ( diffuseColor.a / max(opacity,1e-4) < alphaTest ) discard;',
        )
        .replace(
          '#include <output_fragment>',
          `
      float fres = pow(1.0 - clamp(abs(dot(geometry.normal, geometry.viewDir)),0.0,1.0), 3.2);
      outgoingLight += fres * uRim * uRimCol;
      float baseA = diffuseColor.a / max(opacity, 1e-4);
      float outA  = clamp(baseA + fres*uRimA
                        + uSpecA*dot(outgoingLight, vec3(0.3333)), 0.0, 1.0) * opacity;
      gl_FragColor = vec4( outgoingLight, outA );
    `,
        );
    };

    const mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false;
    const group = new THREE.Group();
    group.add(mesh);
    scene.add(group);

    // Soft atmospheric shadow halo behind the white sheet
    const haloTex = (() => {
      const s = 256;
      const c = document.createElement('canvas');
      c.width = c.height = s;
      const x = c.getContext('2d')!;
      const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, 'rgba(15, 45, 85, .20)');
      g.addColorStop(0.5, 'rgba(15, 45, 85, .09)');
      g.addColorStop(1, 'rgba(15, 45, 85, 0)');
      x.fillStyle = g;
      x.fillRect(0, 0, s, s);
      const t = new THREE.CanvasTexture(c);
      t.encoding = THREE.sRGBEncoding;
      return t;
    })();
    const haloGeo = new THREE.PlaneGeometry(3.9, 4.9);
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.68,
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.z = -0.62;
    group.add(halo);

    // Pointer interaction — drag to turn, hover to light
    let dragging = false;
    let dragYaw = 0;
    let dragPitch = 0;
    let release = 0;
    let velYaw = 0;
    let velPitch = 0;
    let prevYaw = 0;
    let prevPitch = 0;
    let lastPX = 0;
    let lastPY = 0;
    let overSheet = false;
    let hover = 0;
    let hoverTarget = 0;
    let quad: [number, number][] | null = null;
    let cursorNow = '';
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    let vw = host.clientWidth || window.innerWidth;
    let vh = host.clientHeight || window.innerHeight;

    const _v = new THREE.Vector3();
    function cornerPoint(qx: number, qy: number) {
      const t = uni.uTime.value;
      const ph = uni.uPhase.value;
      const A = uni.uAmp.value;
      const F = uni.uFreq.value;
      const TWs = uni.uTwist.value;
      const u = qx;
      const v = qy;
      const theta = (uu: number) =>
        A *
        (0.1 + Math.pow(uu, 1.35)) *
        (0.5 + 0.64 * v) *
        Math.sin(F * uu + TWs * v + t * 0.4 + ph);
      let x = 0;
      let z = 0;
      let xe = 0;
      let ze = 0;
      const N = 20;
      const h = 1 / N;
      for (let i = 0; i < N; i++) {
        const uu = (i + 0.5) * h;
        const w = clamp((u - (uu - 0.5 * h)) / h, 0, 1);
        const th = theta(uu);
        const c = Math.cos(th);
        const s = Math.sin(th);
        xe += c * h;
        ze += s * h;
        x += c * h * w;
        z += s * h * w;
      }
      const yo =
        0.021 * SH * Math.sin(2.05 * u + t * 0.47 + ph) +
        0.013 * SH * Math.sin(3.35 * u - 1.55 * v + t * 0.63 + ph) * (1 - 0.55 * v);
      return _v.set((x - xe * 0.5) * SW, (v - 0.5) * SH + yo, (z - ze * 0.5) * SW);
    }

    function buildQuad() {
      const pts: [number, number][] = [];
      for (const [u, v] of [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ]) {
        cornerPoint(u, v).applyMatrix4(group.matrixWorld).project(camera);
        pts.push([(_v.x * 0.5 + 0.5) * vw, (-_v.y * 0.5 + 0.5) * vh]);
      }
      const cx = (pts[0][0] + pts[1][0] + pts[2][0] + pts[3][0]) / 4;
      const cy = (pts[0][1] + pts[1][1] + pts[2][1] + pts[3][1]) / 4;
      quad = pts.map(([x, y]) => [cx + (x - cx) * 1.05, cy + (y - cy) * 1.05]);
    }

    function inQuad(px: number, py: number) {
      if (!quad) return false;
      let sign = 0;
      for (let i = 0; i < 4; i++) {
        const [ax, ay] = quad[i];
        const [bx, by] = quad[(i + 1) % 4];
        const c = (bx - ax) * (py - ay) - (by - ay) * (px - ax);
        if (c !== 0) {
          const s = c > 0 ? 1 : -1;
          if (sign === 0) sign = s;
          else if (s !== sign) return false;
        }
      }
      return true;
    }

    const getLocalCoords = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      return {
        lx: clientX - rect.left,
        ly: clientY - rect.top,
        w: rect.width || vw || 1,
        h: rect.height || vh || 1,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      const { lx, ly, w, h } = getLocalCoords(e.clientX, e.clientY);
      mouse.tx = (lx / w - 0.5) * 2;
      mouse.ty = (ly / h - 0.5) * 2;
      if (dragging) {
        const dx = e.clientX - lastPX;
        const dy = e.clientY - lastPY;
        lastPX = e.clientX;
        lastPY = e.clientY;
        dragYaw += dx * 0.006;
        dragPitch = clamp(dragPitch - dy * 0.0045, -0.6, 0.6);
        return;
      }
      overSheet = inQuad(lx, ly);
      hoverTarget = overSheet ? 1 : 0;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!isActiveRef.current || !enableDragTurnRef.current) return;
      const { lx, ly } = getLocalCoords(e.clientX, e.clientY);
      const hit = inQuad(lx, ly);
      onPaperPointerDownRef.current?.(hit);
      if (hit) {
        dragging = true;
        onPaperDragStateChangeRef.current?.(true);
        lastPX = e.clientX;
        lastPY = e.clientY;
        velYaw = velPitch = 0;
        prevYaw = dragYaw;
        prevPitch = dragPitch;
      }
    };

    const onPointerUp = () => {
      if (dragging) {
        dragging = false;
        release = 0.6;
        onPaperDragStateChangeRef.current?.(false);
      }
    };

    const onPointerLeave = () => {
      hoverTarget = 0;
      overSheet = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    host.addEventListener('pointerleave', onPointerLeave);

    const resize = () => {
      vw = host.clientWidth || window.innerWidth;
      vh = host.clientHeight || window.innerHeight;
      if (vw <= 0 || vh <= 0) return;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(vw, vh, false);
      camera.aspect = vw / vh;
      camera.updateProjectionMatrix();
      const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const visW = visH * camera.aspect;
      const baseDesktopCap = widthFill > 0.88 ? 0.78 : 0.64;
      const wCap = Math.min(widthFill, baseDesktopCap + Math.max(0, 1.45 - camera.aspect) * 0.42);
      group.scale.setScalar(Math.min((visH * heightFill) / SH, (visW * wCap) / SW));
      if (mesh.visible && isActiveRef.current) {
        renderer.render(scene, camera);
      }
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();
    const lightPos = new THREE.Vector3();
    let intro = 0;
    let frameId = 0;
    let disposed = false;
    let paused = typeof document !== 'undefined' && document.hidden;

    const afterDraw = (cb: () => void) => {
      try {
        const gl = renderer.getContext() as WebGL2RenderingContext;
        if (!gl.fenceSync) {
          frameId = window.setTimeout(cb, 80);
          return;
        }
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (disposed) {
            if (sync) gl.deleteSync(sync);
            return;
          }
          const state = sync ? gl.getSyncParameter(sync, gl.SYNC_STATUS) : gl.SIGNALED;
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } catch {
        frameId = window.setTimeout(cb, 80);
      }
    };

    const scheduleNext = () => {
      if (disposed || paused || !isActiveRef.current) return;
      if (isSoftwareGl) {
        afterDraw(frame);
      } else {
        frameId = requestAnimationFrame(frame);
      }
    };

    resumeLoopRef.current = () => {
      if (disposed || paused || !isActiveRef.current) return;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      clock.getDelta();
      frame();
    };

    function frame() {
      if (disposed || paused || !isActiveRef.current) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      uni.uTime.value = isReducedMotion ? 2.4 : t;

      const introProgress = isReducedMotion ? 1 : Math.min(1, t / 0.65);
      intro = 1 - Math.pow(1 - introProgress, 3);
      const revealAlpha = isReducedMotion ? 1 : 0.6 + 0.4 * intro;
      mat.opacity = revealAlpha;
      haloMat.opacity = revealAlpha * 0.55;

      if (dragging) {
        const k = Math.min(1, dt * 14);
        velYaw += ((dragYaw - prevYaw) / Math.max(dt, 1e-3) - velYaw) * k;
        velPitch += ((dragPitch - prevPitch) / Math.max(dt, 1e-3) - velPitch) * k;
        velYaw = clamp(velYaw, -7, 7);
        velPitch = clamp(velPitch, -4, 4);
      } else {
        dragYaw += velYaw * dt;
        dragPitch = clamp(dragPitch + velPitch * dt, -0.6, 0.6);
        const decay = Math.pow(0.018, dt);
        velYaw *= decay;
        velPitch *= decay;
        release = Math.max(0, release - dt);
        if (release <= 0) {
          const home = Math.round(dragYaw / (Math.PI * 2)) * Math.PI * 2;
          const k = Math.min(1, dt * 0.55);
          dragYaw += (home - dragYaw) * k;
          dragPitch -= dragPitch * k;
        }
      }
      prevYaw = dragYaw;
      prevPitch = dragPitch;

      mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3.0);
      mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3.0);
      const idle = isReducedMotion ? 0 : 1;
      const rise = 1 - intro;
      group.rotation.y = dragYaw + mouse.x * 0.16 + Math.sin(t * 0.23) * 0.045 * idle;
      group.rotation.x = dragPitch - mouse.y * 0.11 + Math.sin(t * 0.19) * 0.026 * idle + rise * 0.28;
      group.rotation.z = Math.sin(t * 0.27) * 0.018 * idle;
      group.position.y = Math.sin(t * 0.36) * 0.06 * idle - rise * 0.7;
      group.position.x = Math.sin(t * 0.21) * 0.05 * idle + mouse.x * 0.1;
      group.updateMatrixWorld();

      hover += (hoverTarget - hover) * Math.min(1, dt * 4.5);
      touchLight.intensity = hover * 2.6 * intro;
      if (hover > 0.002) {
        lightPos
          .set(mouse.tx, -mouse.ty, 0.5)
          .unproject(camera)
          .sub(camera.position)
          .normalize();
        touchLight.position
          .copy(camera.position)
          .addScaledVector(lightPos, (1.75 - camera.position.z) / lightPos.z);
      }

      buildQuad();
      const wantCursor = dragging ? 'grabbing' : overSheet ? 'grab' : '';
      if (wantCursor !== cursorNow) {
        cursorNow = wantCursor;
        if (host) host.style.cursor = wantCursor;
      }

      renderer.render(scene, camera);
      scheduleNext();
    }

    const onVisibilityChange = () => {
      paused = document.hidden;
      if (!paused && !disposed) {
        clock.getDelta();
        scheduleNext();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      paused = true;
    };
    const onContextRestored = () => {
      paused = false;
      clock.getDelta();
      scheduleNext();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const refreshTexture = () => {
      if (disposed) return;
      const t2 = buildPaperTexture();
      currentTex.dispose();
      currentTex = t2;
      mat.map = t2;
      mat.emissiveMap = t2;
      mat.needsUpdate = true;
      if (mesh.visible && isActiveRef.current) {
        renderer.render(scene, camera);
      }
    };

    const boot = () => {
      if (disposed) return;
      resize();
      mesh.visible = true;
      clock.start();
      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }
      mat.opacity = 1;
      frame();
    };

    boot();

    if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
      Promise.race([
        Promise.all(fontLoads.map((f) => document.fonts.load(f))).then(
          () => document.fonts.ready,
        ),
        new Promise<void>((r) => setTimeout(r, 2200)),
      ]).then(refreshTexture);
    }

    return () => {
      disposed = true;
      resumeLoopRef.current = null;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      host.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      geo.dispose();
      haloGeo.dispose();
      currentTex.dispose();
      thicknessMap.dispose();
      haloTex.dispose();
      envRT.dispose();
      mat.dispose();
      haloMat.dispose();
      renderer.dispose();
    };
  }, [rimColor, rimIntensity, touchLightColor, fontLoads, heightFill, widthFill]);

  return (
    <div
      ref={hostRef}
      className={`threeui-background three-d-paper relative w-full h-full overflow-hidden ${
        webglFailed ? 'bg-[#eef5fc]' : '!bg-transparent'
      } ${className}`}
      role="region"
      aria-label="Seminar cover 3D paper"
    >
      {webglFailed ? (
        <div className="absolute inset-0 flex items-center justify-center p-8 bg-[#eef5fc]">
          <div className="max-w-xl w-full rounded-xl border border-slate-200 bg-gradient-to-b from-white to-[#f1f7fd] px-10 py-14 text-center shadow-xl">
            <p className="font-['Plus_Jakarta_Sans'] text-xs font-semibold uppercase tracking-[0.28em] text-sky-600">
              Technical Seminar
            </p>
            <h1 className="mt-6 font-['Playfair_Display'] text-4xl sm:text-5xl font-semibold tracking-tight text-[#0b192c] leading-[1.12]">
              REVISITING DATA
              <br />
              RECOVERY LOOPS
              <br />
              IN 6G NETWORKS
            </h1>
            <p className="mt-6 font-['Plus_Jakarta_Sans'] text-base text-slate-600 leading-relaxed">
              Reliability, Retransmission &amp; Latency in Next-Generation Wireless Communication
            </p>
            <div className="mt-10 pt-6 border-t border-slate-200 font-['Plus_Jakarta_Sans'] text-sm font-medium text-[#0b192c]">
              Presented by Team of 9
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 z-[1] pointer-events-none"
            style={{
              background:
                'radial-gradient(54% 54% at 50% 48%, rgba(14, 165, 233, 0.08) 0%, rgba(224, 242, 254, 0.14) 48%, rgba(238, 245, 252, 0) 92%)',
            }}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full block pointer-events-none z-[3]"
          />
          <div
            ref={grainRef}
            aria-hidden="true"
            className="absolute inset-0 z-[4] pointer-events-none bg-repeat bg-[length:160px_160px] opacity-[0.045] mix-blend-overlay"
            style={{
              WebkitMaskImage:
                'radial-gradient(52% 58% at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 76%)',
              maskImage:
                'radial-gradient(52% 58% at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 76%)',
            }}
          />
          <div
            ref={grain2Ref}
            aria-hidden="true"
            className="absolute inset-0 z-[4] pointer-events-none bg-repeat bg-[length:160px_160px] opacity-[0.02]"
            style={{
              WebkitMaskImage:
                'radial-gradient(52% 58% at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 76%)',
              maskImage:
                'radial-gradient(52% 58% at 50% 50%, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 76%)',
            }}
          />
        </>
      )}
    </div>
  );
}
