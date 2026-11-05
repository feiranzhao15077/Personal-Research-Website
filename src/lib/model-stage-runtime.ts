import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { MeshoptDecoder } from 'meshoptimizer/decoder';
import { isPageScrolling, onPageScrollChange, waitForPageScrollIdle } from './page-scroll';

const modelCache = new Map<string, Promise<GLTF>>();
function aircraft(url: string, progress: (loaded: number, total: number) => void, defer?: () => Promise<boolean>) {
  if (!modelCache.has(url)) {
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const loaded = defer ? (async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Model request failed: ${response.status}`);
      const bytes = await response.arrayBuffer();
      if (!await defer()) throw new DOMException('Model preparation cancelled', 'AbortError');
      progress(bytes.byteLength, bytes.byteLength);
      return loader.parseAsync(bytes, new URL('.', new URL(url, document.baseURI)).href);
    })() : loader.loadAsync(url, event => progress(event.loaded, event.total));
    modelCache.set(url, loaded.catch(error => { modelCache.delete(url); throw error; }));
  }
  return modelCache.get(url)!;
}

export async function mountModelStage(root: HTMLElement) {
  if (root.dataset.stageMounted) return;
  root.dataset.stageMounted = 'true';
  const canvas = root.querySelector<HTMLCanvasElement>('[data-stage-canvas]')!;
  const surface = root.querySelector<HTMLElement>('[data-stage-surface]')!;
  const status = root.querySelector<HTMLElement>('[data-stage-status]')!;
  const retry = root.querySelector<HTMLButtonElement>('[data-stage-retry]');
  const controlsRoot = root.id ? document.querySelector<HTMLElement>(`[data-stage-controls-for="${CSS.escape(root.id)}"]`) : null;
  const buttons = Array.from((controlsRoot || root).querySelectorAll<HTMLButtonElement>('[data-stage-action]'));
  const mode = root.dataset.stageMode;
  const entry = mode === 'entry';
  const open = mode === 'viewer';
  const lifetime = new AbortController();
  const entryIdle = () => entry ? waitForPageScrollIdle(lifetime.signal) : Promise.resolve(true);
  const compact = matchMedia('(max-width: 700px), (pointer: coarse)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let destroyed = false, visible = false, drawing = false, frame = 0, last = 0, lastRender = 0;
  let ready = false, hovering = false, rotating = !reduce.matches, spin = rotating ? .052 : 0;
  let activeModel: THREE.Group | null = null, refinementQueued = false, refinementTimer = 0;
  let mixer: THREE.AnimationMixer | null = null, orbitAction: THREE.AnimationAction | null = null, assemblyAction: THREE.AnimationAction | null = null, motionAction: THREE.AnimationAction | null = null;
  let orbitTime = 0, assemblyFraction = 0, assemblyTarget = 0, assemblyCameraAuto = false;
  const motion = surface.dataset.stageMotion ? JSON.parse(surface.dataset.stageMotion) as { clip: string; start: number; end: number; label: string } : null;
  let motionTime: number | null = null;
  type ModelFrame = { width: number; height: number; centerY: number; centerX?: number; centerZ?: number; bounds: THREE.Box3; points?: THREE.Vector3[] };
  let assembledFrame: ModelFrame | null = null, expandedFrame: ModelFrame | null = null, motionFrame: ModelFrame | null = null;
  const assemblyStart = Number(root.dataset.stageAssemblyStart || 0), assemblyEnd = Number(root.dataset.stageAssemblyEnd || 0);
  const retiredModels: THREE.Group[] = [];
  let shadowAngle = NaN, shadowDirty = true;
  let lightLevel = compact || open ? 1 : 0;
  let reveal = open ? 0 : 1;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !compact, powerPreference: compact ? 'low-power' : 'high-performance' });
  } catch {
    status.textContent = '当前浏览器暂时无法打开三维模型，高清图仍可查看。';
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, entry ? compact ? 1 : 1.25 : compact ? 1.25 : 1.65));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .95;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 24);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmrem.fromScene(environment, .04, .1, 100, { size: entry ? 128 : 256 });
  scene.environment = environmentMap.texture;
  scene.environmentIntensity = .55;
  environment.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfafaff, 0x9b9e9a, .55));
  const fill = new THREE.DirectionalLight(0xe9f1ff, .7); fill.position.set(3, 5, -3); scene.add(fill);

  const groundColor = new THREE.Color(getComputedStyle(root).getPropertyValue('--model-ground').trim() || '#f7f7f2');
  const matte = new THREE.MeshStandardMaterial({ color: groundColor, roughness: .8, metalness: .05 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xa8b3b3, roughness: .34, metalness: .55 });
  const pedestal = new THREE.Mesh(new THREE.BoxGeometry(3.22, .13, 3.22), matte);
  pedestal.position.y = .02; pedestal.receiveShadow = true; scene.add(pedestal);
  const underside = new THREE.Mesh(new THREE.BoxGeometry(3.12, .038, 3.12), metal);
  underside.position.y = -.032; scene.add(underside);
  const turntable = new THREE.Group(); scene.add(turntable);
  const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.405, 1.405, .09, compact ? 64 : 112), new THREE.MeshStandardMaterial({ color: 0xd0d6d1, roughness: .62, metalness: .15 }));
  platter.position.y = .142; platter.receiveShadow = true; turntable.add(platter);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.385, .012, 8, 96), metal);
  rim.rotation.x = Math.PI / 2; rim.position.y = .186; turntable.add(rim);
  turntable.rotation.y = -.32;

  const cabinet = new THREE.Group(); scene.add(cabinet);
  // Geometry is a real display case; the thin glass remains optically quiet.
  // Thin cabinet panes need reflection, not another refraction render of the whole aircraft.
  const glass = new THREE.MeshStandardMaterial({ color: 0xe7f0ee, roughness: .07, metalness: 0, envMapIntensity: .65, transparent: true, opacity: .065, side: THREE.DoubleSide, depthWrite: false, forceSinglePass: true });
  const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xb7c4c3, roughness: .28, metalness: .55, transparent: true });
  const top = 1.58, bottom = .09, half = 1.6;
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.2, top - bottom, 3.2)), new THREE.LineBasicMaterial({ color: 0xa4b8b7, transparent: true, opacity: .55 }));
  edge.position.y = (top + bottom) / 2; cabinet.add(edge);
  for (const axis of ['x', 'z'] as const) for (const side of [-1, 1]) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(3.2, top - bottom), glass);
    pane.position.y = (top + bottom) / 2; pane.position[axis] = side * half;
    if (axis === 'x') pane.rotation.y = Math.PI / 2;
    pane.renderOrder = 2; cabinet.add(pane);
  }
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), glass);
  roof.rotation.x = Math.PI / 2; roof.position.y = top; roof.renderOrder = 2; cabinet.add(roof);
  for (const z of [-half, half]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(3.23, .025, .028), frameMaterial);
    bar.position.set(0, top, z); cabinet.add(bar);
  }
  for (const x of [-half, half]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(.028, .025, 3.23), frameMaterial);
    bar.position.set(x, top, 0); cabinet.add(bar);
  }

  const spots: THREE.SpotLight[] = [], lampMaterials: THREE.MeshStandardMaterial[] = [], beams: THREE.Mesh[] = [];
  const beamMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    uniforms: { strength: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: 'varying vec2 vUv; uniform float strength; void main(){float edge=pow(sin(vUv.x*3.14159265),2.0); float a=edge*smoothstep(0.0,0.3,vUv.y)*(0.025+0.075*vUv.y)*strength; gl_FragColor=vec4(1.0,0.97,0.84,a); }',
  });
  for (const side of [-1, 1]) {
    const position = new THREE.Vector3(side * 1.08, 1.51, .42);
    const aim = new THREE.Vector3(side * .32, .33, .05);
    const direction = position.clone().sub(aim).normalize();
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.105, .105, .1, 24), new THREE.MeshStandardMaterial({ color: 0x536369, metalness: .7, roughness: .28, transparent: true }));
    lamp.position.copy(position); lamp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction); cabinet.add(lamp);
    const lensMaterial = new THREE.MeshStandardMaterial({ color: 0xfff8dd, emissive: 0xffedc0, emissiveIntensity: .12, roughness: .24, transparent: true });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(.088, 24), lensMaterial);
    lens.position.copy(position).addScaledVector(direction, -.054); lens.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction.clone().negate()); cabinet.add(lens); lampMaterials.push(lensMaterial);
    const spot = new THREE.SpotLight(0xfff2db, .6, 9, .55, .8, 2);
    spot.position.copy(position).addScaledVector(direction, -.06); spot.target.position.copy(aim);
    spot.castShadow = side === -1; const shadowSize = entry && compact ? 256 : compact || entry ? 512 : 1024; spot.shadow.mapSize.set(shadowSize, shadowSize); spot.shadow.bias = -.0002; spot.shadow.normalBias = .012; spot.shadow.radius = 2; spot.shadow.camera.near = .2; spot.shadow.camera.far = 4;
    scene.add(spot, spot.target); spots.push(spot);
    const beam = new THREE.Mesh(new THREE.ConeGeometry(.61, position.distanceTo(aim), 40, 1, true), beamMaterial);
    beam.position.copy(position).add(aim).multiplyScalar(.5); beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction); cabinet.add(beam); beams.push(beam);
  }

  const controls = entry ? null : new OrbitControls(camera, canvas);
  if (controls) {
    controls.enableDamping = true; controls.dampingFactor = .095;
    controls.rotateSpeed = .68; controls.zoomSpeed = .7; controls.panSpeed = .55;
    controls.minPolarAngle = .09; controls.maxPolarAngle = open ? Math.PI - .09 : Math.PI / 2 - .035;
    controls.maxTargetRadius = .85; controls.cursor.set(0, .53, 0);
  }
  const center = new THREE.Vector3(0, open ? .48 : .4, 0);
  const direction = new THREE.Vector3(.65, .43, .75).normalize();
  let openDistance = 4, closedDistance = 6;
  let displayWidth = 2.64, displayHeight = 1.06;
  let displayBounds: THREE.Box3 | null = null;
  let displayPoints: THREE.Vector3[] | undefined;
  const animatedModelDistance = (view: THREE.Vector3, target: THREE.Vector3) => {
    if (!displayBounds) return 0;
    const outward = view.clone().normalize();
    const right = new THREE.Vector3().crossVectors(camera.up, outward).normalize();
    const up = new THREE.Vector3().crossVectors(outward, right).normalize();
    const vertical = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * .82;
    let distance = 0;
    if (displayPoints?.length) {
      // Fit the aircraft silhouette, rather than the empty corners of its box.
      // These bounded samples are collected once; no mesh traversal runs per frame.
      for (const point of displayPoints) {
        const corner = point.clone().applyAxisAngle(camera.up, turntable.rotation.y).sub(target);
        distance = Math.max(distance, corner.dot(outward) + Math.max(Math.abs(corner.dot(right)) / (vertical * camera.aspect), Math.abs(corner.dot(up)) / vertical));
      }
      return distance;
    }
    // Projecting components need perspective depth as well as width and height.
    for (const x of [displayBounds.min.x, displayBounds.max.x]) for (const y of [displayBounds.min.y, displayBounds.max.y]) for (const z of [displayBounds.min.z, displayBounds.max.z]) {
      const corner = new THREE.Vector3(x, y, z).applyAxisAngle(camera.up, turntable.rotation.y).sub(target);
      distance = Math.max(distance, corner.dot(outward) + Math.max(Math.abs(corner.dot(right)) / (vertical * camera.aspect), Math.abs(corner.dot(up)) / vertical));
    }
    return distance;
  };
  const cabinetDistance = (view: THREE.Vector3, target: THREE.Vector3) => {
    const outward = view.clone().normalize();
    const right = new THREE.Vector3().crossVectors(camera.up, outward).normalize();
    const up = new THREE.Vector3().crossVectors(outward, right).normalize();
    const vertical = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * .88;
    let distance = 0;
    // Fit all eight corners in perspective, including the nearest base corner.
    for (const x of [-1.64, 1.64]) for (const y of [-.06, 1.61]) for (const z of [-1.64, 1.64]) {
      const corner = new THREE.Vector3(x, y, z).sub(target);
      distance = Math.max(distance, corner.dot(outward) + Math.max(Math.abs(corner.dot(right)) / (vertical * camera.aspect), Math.abs(corner.dot(up)) / vertical));
    }
    return distance;
  };
  const distances = () => {
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    openDistance = Math.max(displayWidth / (2 * tan * camera.aspect * .82), displayHeight / (2 * tan * .75), animatedModelDistance(direction, center));
    closedDistance = cabinetDistance(direction, center);
    camera.far = Math.max(24, Math.max(openDistance, closedDistance) * 2.6); camera.updateProjectionMatrix();
    if (controls) { controls.minDistance = .85; controls.maxDistance = Math.max(openDistance, closedDistance) * 1.8; }
  };
  const initialCamera = () => {
    controls?.target.copy(center);
    camera.position.copy(center).addScaledVector(direction, open ? openDistance : closedDistance);
    camera.lookAt(center); controls?.update();
  };
  let cameraTween: { from: THREE.Spherical; to: THREE.Spherical; target: THREE.Vector3; fromTarget: THREE.Vector3; start: number; duration: number } | null = null;
  const moveCamera = (view: string) => {
    if (!controls) return;
    reveal = 1; if (open) cabinet.visible = false;
    const target = center.clone();
    const vector = view === 'top' ? new THREE.Vector3(.15, .99, .18) : view === 'rear' ? new THREE.Vector3(-.62, .36, -.77) : view === 'underside' ? new THREE.Vector3(.5, -.6, .75) : direction;
    const to = new THREE.Spherical().setFromVector3(vector.clone().normalize().multiplyScalar(open ? Math.max(openDistance, animatedModelDistance(vector, target)) : cabinetDistance(vector, target)));
    const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    to.theta = from.theta + Math.atan2(Math.sin(to.theta - from.theta), Math.cos(to.theta - from.theta));
    cameraTween = { from, to, target, fromTarget: controls.target.clone(), start: performance.now(), duration: reduce.matches ? 1 : 600 };
    wake();
  };
  const resize = new ResizeObserver(() => {
    const width = surface.clientWidth, height = surface.clientHeight;
    if (!width || !height) return;
    const previousDistance = open ? openDistance : closedDistance;
    camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); distances();
    if (!ready || entry) initialCamera();
    else if (controls) { camera.position.sub(controls.target).multiplyScalar((open ? openDistance : closedDistance) / previousDistance).add(controls.target); controls.update(); }
    wake();
  }); resize.observe(surface);

  function wake() { if (!destroyed && visible && !document.hidden && !(entry && isPageScrolling()) && !frame && !drawing) { last = performance.now(); frame = requestAnimationFrame(tick); } }
  function tick(now: number) {
    frame = 0;
    if (destroyed || !visible || document.hidden || (entry && isPageScrolling())) return;
    const interval = entry ? 1000 / (compact ? 20 : 24) : compact ? 1000 / 30 : 1000 / 60;
    if (now - lastRender < interval - 1) { frame = requestAnimationFrame(tick); return; }
    drawing = true;
    const dt = Math.min((now - last) / 1000, .08); last = now; lastRender = now;
    const lightTarget = open || compact || hovering ? 1 : 0;
    lightLevel = reduce.matches ? lightTarget : THREE.MathUtils.damp(lightLevel, lightTarget, 2.9, dt);
    const spinTarget = ready && !orbitAction && rotating && !(entry && hovering) && !reduce.matches ? .052 : 0;
    spin = THREE.MathUtils.damp(spin, spinTarget, 3.8, dt);
    turntable.rotation.y += spin * dt;
    const orbiting = !!orbitAction && rotating && !(entry && hovering) && motionTime === null && !reduce.matches;
    const assembling = assemblyFraction !== assemblyTarget;
    const moving = motionTime !== null && !!motion && !reduce.matches;
    if (moving && motion) {
      motionTime = Math.min(motion.end - motion.start, motionTime! + dt);
      if (motionTime === motion.end - motion.start) { resetAssembly(); moveCamera('front'); }
    }
    if (orbiting && orbitAction) orbitTime = (orbitTime + dt * .25) % orbitAction.getClip().duration;
    if (assembling) {
      const step = dt / Math.max(.1, assemblyEnd - assemblyStart);
      assemblyFraction = reduce.matches ? assemblyTarget : assemblyTarget > assemblyFraction ? Math.min(assemblyTarget, assemblyFraction + step) : Math.max(assemblyTarget, assemblyFraction - step);
    }
    if (orbiting || assembling || moving) {
      sampleAnimations(); shadowDirty = true;
      if (!assemblyFraction && !assemblyTarget && assemblyCameraAuto) { assemblyCameraAuto = false; applyModelFrame(false); moveCamera('front'); }
    }
    if (open && ready && reveal < 1) {
      reveal = reduce.matches ? 1 : Math.min(1, reveal + dt / 1.4);
      const t = 1 - Math.pow(1 - reveal, 3);
      camera.position.copy(center).addScaledVector(direction, THREE.MathUtils.lerp(closedDistance, openDistance, t));
      controls?.target.copy(center); camera.lookAt(center);
      glass.opacity = .065 * (1 - t); frameMaterial.opacity = 1 - t;
      (edge.material as THREE.LineBasicMaterial).opacity = .55 * (1 - t);
      cabinet.traverse(object => { if (object instanceof THREE.Mesh && !beams.includes(object) && object.material !== glass && object.material !== frameMaterial) (object.material as THREE.Material).opacity = 1 - t; });
      beamMaterial.uniforms.strength.value = lightLevel * (1 - t);
      if (reveal === 1) cabinet.visible = false;
    } else beamMaterial.uniforms.strength.value = open ? 0 : lightLevel;
    spots.forEach(spot => { spot.intensity = THREE.MathUtils.lerp(.12, 3.8, lightLevel); });
    lampMaterials.forEach(material => { material.emissiveIntensity = .1 + lightLevel * 3.2; });
    if (cameraTween && controls) {
      const p = Math.min(1, (now - cameraTween.start) / cameraTween.duration), t = 1 - Math.pow(1 - p, 4);
      const spherical = new THREE.Spherical(THREE.MathUtils.lerp(cameraTween.from.radius, cameraTween.to.radius, t), THREE.MathUtils.lerp(cameraTween.from.phi, cameraTween.to.phi, t), THREE.MathUtils.lerp(cameraTween.from.theta, cameraTween.to.theta, t));
      controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.target, t); camera.position.setFromSpherical(spherical).add(controls.target);
      if (p === 1) cameraTween = null;
    }
    const changing = controls?.update(dt) || false;
    // Orbiting and fading lights do not change the scene's shadow geometry.
    renderer.shadowMap.needsUpdate = ready && (shadowDirty || !Number.isFinite(shadowAngle) || Math.abs(turntable.rotation.y - shadowAngle) > .002);
    if (renderer.shadowMap.needsUpdate) { shadowAngle = turntable.rotation.y; shadowDirty = false; }
    renderer.render(scene, camera);
    if (ready) { root.dataset.stageRendered = 'true'; queueRefinement(); }
    drawing = false;
    if (orbiting || assemblyFraction !== assemblyTarget || (motionTime !== null && !reduce.matches) || Math.abs(spin) > .00005 || Math.abs(lightLevel - lightTarget) > .0003 || changing || cameraTween || (open && ready && reveal < 1)) frame = requestAnimationFrame(tick);
  }
  const headerHeight = Math.ceil(document.querySelector('.site-header, .space-nav, .cabinet-nav')?.getBoundingClientRect().height || 0);
  const visibility = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) wake(); else { cancelAnimationFrame(frame); frame = 0; } }, { rootMargin: `-${headerHeight}px 0px 0px 0px` }); visibility.observe(root);
  const visibilityChange = () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else wake(); };
  document.addEventListener('visibilitychange', visibilityChange);
  const stopScroll = entry ? onPageScrollChange(scrolling => {
    root.dataset.stageScrollPaused = String(scrolling);
    if (scrolling) { cancelAnimationFrame(frame); frame = 0; } else wake();
  }) : () => {};
  const hoverTarget = root.closest<HTMLElement>('[data-model-entrance]') || root;
  hoverTarget.addEventListener('pointerenter', () => { hovering = true; wake(); });
  hoverTarget.addEventListener('pointerleave', () => { hovering = false; wake(); });
  hoverTarget.addEventListener('focusin', () => { hovering = true; wake(); });
  hoverTarget.addEventListener('focusout', event => { if (!hoverTarget.contains((event as FocusEvent).relatedTarget as Node | null)) { hovering = false; wake(); } });
  const rotateButton = buttons.find(button => button.dataset.stageAction === 'rotate');
  const assemblyButton = buttons.find(button => button.dataset.stageAction === 'assembly');
  const motionButton = buttons.find(button => button.dataset.stageAction === 'motion');
  const rotationState = () => { rotateButton?.setAttribute('aria-pressed', String(rotating)); };
  const assemblyState = () => { if (assemblyButton) { assemblyButton.textContent = assemblyTarget ? surface.dataset.stageAssemblyReturnLabel || '组装' : surface.dataset.stageAssemblyLabel || '分解'; assemblyButton.setAttribute('aria-pressed', String(!!assemblyTarget)); } };
  controls?.addEventListener('change', wake);
  controls?.addEventListener('start', () => { cameraTween = null; assemblyCameraAuto = false; reveal = 1; if (open) cabinet.visible = false; rotating = false; rotationState(); wake(); });
  buttons.forEach(button => button.addEventListener('click', () => {
    if (button.dataset.stageAction === 'rotate') { if (motionTime !== null) { resetAssembly(); moveCamera('front'); } rotating = !rotating; rotationState(); wake(); }
    else if (button.dataset.stageAction === 'motion' && motionAction && motion) {
      const stop = motionTime !== null;
      resetAssembly(); rotating = false; rotationState();
      if (!stop && !reduce.matches) { motionTime = 0; sampleAnimations(); motionButton?.setAttribute('aria-pressed', 'true'); if (motionFrame) setModelFrame(motionFrame); }
      else if (!stop) { motionTime = (motion.end - motion.start) * .55; sampleAnimations(); motionButton?.setAttribute('aria-pressed', 'true'); if (motionFrame) setModelFrame(motionFrame); }
      moveCamera('front'); wake();
    }
    else if (button.dataset.stageAction === 'assembly' && assemblyAction) {
      if (motionTime !== null) resetAssembly();
      rotating = false; rotationState(); assemblyTarget = assemblyTarget ? 0 : 1; assemblyCameraAuto = true; assemblyState();
      applyModelFrame(true); moveCamera(surface.dataset.stageAssemblyView || 'front');
      if (reduce.matches) { assemblyFraction = assemblyTarget; sampleAnimations(); shadowDirty = true; if (!assemblyTarget) { applyModelFrame(false); moveCamera('front'); } }
      wake();
    }
    else { rotating = false; rotationState(); if (button.dataset.stageAction === 'reset') resetAssembly(); moveCamera(button.dataset.stageAction!); }
  }));
  canvas.addEventListener('keydown', event => {
    if (!controls || !ready) return;
    const delta = camera.position.clone().sub(controls.target), spherical = new THREE.Spherical().setFromVector3(delta);
    if (event.key === 'Home') { event.preventDefault(); rotating = false; rotationState(); resetAssembly(); moveCamera('reset'); return; }
    if (event.key === 'ArrowLeft') spherical.theta -= .12;
    else if (event.key === 'ArrowRight') spherical.theta += .12;
    else if (event.key === 'ArrowUp') spherical.phi = Math.max(.09, spherical.phi - .1);
    else if (event.key === 'ArrowDown') spherical.phi = Math.min(controls.maxPolarAngle, spherical.phi + .1);
    else if (event.key === '+' || event.key === '=') spherical.radius = Math.max(controls.minDistance, spherical.radius * .88);
    else if (event.key === '-') spherical.radius = Math.min(controls.maxDistance, spherical.radius / .88);
    else return;
    event.preventDefault(); rotating = false; cameraTween = null; reveal = 1; if (open) cabinet.visible = false; rotationState(); camera.position.setFromSpherical(spherical).add(controls.target); controls.update(); wake();
  });
  reduce.addEventListener('change', () => { if (reduce.matches) rotating = false; rotationState(); wake(); });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); cancelAnimationFrame(frame); frame = 0; status.hidden = false; status.textContent = '三维画面暂时中断，请刷新页面重新打开；高清图仍可查看。'; });

  const prepareAircraft = (source: THREE.Group) => {
    // Presentation scaling stays outside animated nodes and their original transforms.
    const model = new THREE.Group(); model.add(source.clone(true));
    const bounds = new THREE.Box3().setFromObject(model), size = bounds.getSize(new THREE.Vector3());
    // Fit tall vehicles below the case roof while retaining aircraft proportions.
    const scale = Math.min(2.24 / Math.max(size.x, size.z), 1.18 / Math.max(size.y, .001));
    model.scale.setScalar(scale); model.position.set(-(bounds.min.x + bounds.max.x) / 2 * scale, .19 - bounds.min.y * scale, -(bounds.min.z + bounds.max.z) / 2 * scale);
    model.userData.stageFrame = { bounds: new THREE.Box3().setFromObject(model), width: Math.max(size.x, size.z) * scale + .16, height: size.y * scale + .12, centerY: open ? .19 + size.y * scale / 2 : .4 } satisfies ModelFrame;
    if (open) {
      const meshes: THREE.Mesh[] = [];
      model.traverse(object => { if (object instanceof THREE.Mesh && object.geometry.getAttribute('position')) meshes.push(object); });
      const count = meshes.reduce((total, mesh) => total + mesh.geometry.getAttribute('position').count, 0);
      const stride = Math.max(1, Math.ceil(count / 6000));
      const points: THREE.Vector3[] = [];
      for (const mesh of meshes) {
        const positions = mesh.geometry.getAttribute('position');
        for (let i = 0; i < positions.count; i += stride) points.push(new THREE.Vector3().fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld));
        points.push(new THREE.Vector3().fromBufferAttribute(positions, positions.count - 1).applyMatrix4(mesh.matrixWorld));
      }
      model.userData.stageFrame.points = points;
    }
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      object.castShadow = !materials.some(material => material instanceof THREE.MeshPhysicalMaterial && material.transmission > 0);
      // Close, grazing spotlights otherwise produce moving self-shadow speckles on the thin skin.
      object.receiveShadow = false;
    });
    return model;
  };
  function sampleAnimations() {
    if (orbitAction) orbitAction.enabled = motionTime === null;
    if (assemblyAction) assemblyAction.enabled = motionTime === null;
    if (motionAction) { motionAction.enabled = motionTime !== null; motionAction.time = motion ? motion.start + (motionTime || 0) : 0; }
    if (orbitAction) orbitAction.time = orbitTime;
    if (assemblyAction) assemblyAction.time = assemblyFraction ? assemblyStart + (assemblyEnd - assemblyStart) * assemblyFraction : 0;
    mixer?.update(0);
    if (open && assemblyAction) platter.visible = rim.visible = assemblyFraction === 0 && motionTime === null;
    root.dataset.stageAssemblyProgress = String(Math.round(assemblyFraction * 100));
    root.dataset.stageMotionProgress = motion && motionTime !== null ? String(Math.round(motionTime / (motion.end - motion.start) * 100)) : '0';
  }
  function setModelFrame(fit: ModelFrame) {
    displayWidth = fit.width; displayHeight = fit.height; displayBounds = fit.bounds; displayPoints = fit.points; center.set(fit.centerX || 0, fit.centerY, fit.centerZ || 0).applyAxisAngle(camera.up, turntable.rotation.y); controls?.cursor.copy(center); distances();
  }
  function applyModelFrame(expanded: boolean) {
    const fit = expanded ? expandedFrame : assembledFrame;
    if (!fit) return;
    setModelFrame(fit);
  }
  function resetAssembly() {
    turntable.rotation.y = -.32; orbitTime = 0; assemblyFraction = assemblyTarget = 0; assemblyCameraAuto = false;
    motionTime = null; motionButton?.setAttribute('aria-pressed', 'false');
    sampleAnimations(); assemblyState(); applyModelFrame(false); shadowDirty = true;
  }
  function installAnimations(model: THREE.Group, clips: THREE.AnimationClip[]) {
    mixer?.stopAllAction(); mixer = null; orbitAction = assemblyAction = motionAction = null; motionFrame = null;
    setModelFrame(model.userData.stageFrame as ModelFrame);
    assembledFrame = { ...(model.userData.stageFrame as ModelFrame), bounds: displayBounds!.clone() }; expandedFrame = null;
    if (!open || !root.dataset.stageAssembly) return;
    let assemblyClip = clips.find(clip => clip.name === root.dataset.stageAssembly);
    let orbitClip = clips.find(clip => clip.name === root.dataset.stageOrbit);
    const motionClip = motion ? clips.find(clip => clip.name === motion.clip && clip.duration >= motion.end) : null;
    if (!assemblyClip || !orbitClip || assemblyEnd > assemblyClip.duration) return;
    if (assemblyClip === orbitClip) {
      // Scene exports combine the turntable and assembly into one clip. Bind each
      // track once: rotating must never trigger disassembly or halve its motion.
      const duration = Number(surface.dataset.stageOrbitDuration);
      if (!(duration > 0 && duration <= assemblyStart)) return;
      const rotationTracks = orbitClip.tracks.filter(track => surface.dataset.stageOrbitNode ? track.name === `${surface.dataset.stageOrbitNode}.quaternion` : track.name.endsWith('.quaternion'));
      if (!rotationTracks.length) return;
      orbitClip = new THREE.AnimationClip(`${orbitClip.name}_rotation`, duration, rotationTracks.map(track => track.clone()));
      assemblyClip = new THREE.AnimationClip(`${assemblyClip.name}_assembly`, assemblyClip.duration, assemblyClip.tracks.filter(track => !rotationTracks.includes(track)).map(track => track.clone()));
    }
    mixer = new THREE.AnimationMixer(model);
    orbitAction = mixer.clipAction(orbitClip); assemblyAction = mixer.clipAction(assemblyClip);
    for (const action of [orbitAction, assemblyAction]) { action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play(); action.paused = true; }
    if (motionClip && motion) {
      motionAction = mixer.clipAction(motionClip); motionAction.setLoop(THREE.LoopOnce, 1); motionAction.clampWhenFinished = true; motionAction.play(); motionAction.paused = true;
      orbitAction.enabled = assemblyAction.enabled = false;
      const bounds = new THREE.Box3();
      for (let i = 0; i <= 24; i++) { motionAction.time = motion.start + (motion.end - motion.start) * i / 24; mixer.update(0); bounds.union(new THREE.Box3().setFromObject(model)); }
      const size = bounds.getSize(new THREE.Vector3()), middle = bounds.getCenter(new THREE.Vector3());
      motionFrame = { width: Math.max(size.x, size.z) + .2, height: size.y + .16, centerX: middle.x, centerY: middle.y, centerZ: middle.z, bounds };
      motionAction.enabled = false; orbitAction.enabled = assemblyAction.enabled = true;
    }
    // Measure the supplied exploded pose once, so components stay inside the viewport.
    assemblyAction.time = assemblyEnd; mixer.update(0);
    const bounds = new THREE.Box3().setFromObject(model), size = bounds.getSize(new THREE.Vector3());
    expandedFrame = { width: Math.max(displayWidth, Math.max(size.x, size.z) + .45), height: Math.max(displayHeight, size.y + .35), centerY: (bounds.min.y + bounds.max.y) / 2, bounds };
    sampleAnimations(); if (motionTime !== null && motionFrame) setModelFrame(motionFrame); else applyModelFrame(!!assemblyTarget || assemblyFraction > 0); assemblyState();
    if (rotateButton) { const label = rotateButton.querySelector('[data-stage-rotate-label]'); if (label) label.textContent = '旋转'; }
  }
  function queueRefinement() {
    if (refinementQueued) return; refinementQueued = true;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const url = root.dataset.stageDesktop;
    if (!open || compact || !url || url === root.dataset.stageMobile || connection?.saveData || /^(slow-)?2g$/.test(connection?.effectiveType || '')) return;
    // Draw the lite model first. Download and compile the inspection mesh without hiding it.
    refinementTimer = window.setTimeout(async () => {
      if (destroyed) return;
      try {
        const source = await aircraft(url, () => {});
        if (destroyed) return;
        const model = prepareAircraft(source.scene);
        await renderer.compileAsync(model, camera, scene);
        if (destroyed) return;
        if (activeModel) { turntable.remove(activeModel); retiredModels.push(activeModel); }
        installAnimations(model, source.animations);
        activeModel = model; turntable.add(model); shadowDirty = true;
        root.dataset.stageQuality = 'desktop'; wake();
      } catch (error) { console.warn('Model detail upgrade unavailable; keeping the lite model:', error); }
    }, 450);
  }
  const load = async () => {
    ready = false; delete root.dataset.stageLoaded; delete root.dataset.stageRendered;
    status.hidden = false; status.textContent = '正在加载模型…'; if (retry) retry.hidden = true;
    try {
      const url = (entry ? root.dataset.stagePreview || root.dataset.stageMobile : root.dataset.stageMobile) || root.dataset.stageDesktop;
      const source = await aircraft(url!, (loaded, total) => { if (!destroyed && total) status.textContent = `正在加载模型 ${Math.round(loaded / total * 100)}%`; }, entry ? entryIdle : undefined);
      if (!await entryIdle() || destroyed) return;
      const model = prepareAircraft(source.scene);
      if (activeModel) { turntable.remove(activeModel); retiredModels.push(activeModel); }
      installAnimations(model, source.animations);
      activeModel = model; turntable.add(model); shadowDirty = true;
      if (open) { pedestal.visible = false; underside.visible = false; }
      distances(); initialCamera(); if (open) { camera.position.copy(center).addScaledVector(direction, closedDistance); camera.lookAt(center); controls?.update(); }
      status.textContent = '正在点亮展柜…';
      if (!await entryIdle() || destroyed) return;
      await renderer.compileAsync(scene, camera);
      if (destroyed) return;
      ready = true;
      if (open) rotating = false;
      root.dataset.stageLoaded = 'true'; root.dataset.stageQuality = entry ? 'preview' : 'mobile'; status.hidden = true; buttons.forEach(button => { button.disabled = (button.dataset.stageAction === 'assembly' && !assemblyAction) || (button.dataset.stageAction === 'motion' && !motionAction); }); rotationState(); wake();
    } catch (error) {
      if (destroyed) return;
      status.textContent = '模型没有加载成功，请重试；高清细节图仍可查看。'; if (retry) retry.hidden = false;
      console.warn('Model cabinet load failed:', error); ready = true; rotating = false; wake();
    }
  };
  retry?.addEventListener('click', load);
  const dispose = () => {
    if (destroyed) return; destroyed = true; lifetime.abort(); stopScroll(); cancelAnimationFrame(frame); clearTimeout(refinementTimer); resize.disconnect(); visibility.disconnect(); controls?.dispose(); document.removeEventListener('visibilitychange', visibilityChange);
    const disposeObject = (object: THREE.Object3D) => { if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); } };
    mixer?.stopAllAction(); if (mixer && activeModel) mixer.uncacheRoot(activeModel);
    scene.traverse(disposeObject); retiredModels.forEach(model => model.traverse(disposeObject));
    spots.forEach(spot => spot.shadow.dispose()); environmentMap.dispose(); renderer.dispose();
  };
  window.addEventListener('pagehide', event => { if (!(event as PageTransitionEvent).persisted) dispose(); else { cancelAnimationFrame(frame); frame = 0; } });
  window.addEventListener('pageshow', wake);
  await load();
}
