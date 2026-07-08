window.addEventListener('load', () => {
  const container = document.getElementById('about-3d-canvas-container');
  if (!container) return;

  // Path resolver supporting both root directory (for manual uploads via GitHub UI) and local images/ directory
  function getAssetPath(filename) {
    const isLocal = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' || 
                    window.location.protocol === 'file:';
    return isLocal ? 'images/' + filename : filename;
  }

  // --- 1. Scene, Camera, and Renderer Setup ---
  const scene = new THREE.Scene();
  
  // Robust width & height checking with fallback to prevent 0-size canvas initialization
  let width = container.clientWidth;
  let height = container.clientHeight;
  if (width <= 0 || height <= 0) {
    width = container.parentElement ? container.parentElement.clientWidth : 450;
    height = 650; // Standard designed height for about section wrapper
  }

  // High-end camera settings matching R3F
  const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 100);
  camera.position.set(0, -0.5, 13.8);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.max(window.devicePixelRatio || 1, 2)); // Ensure at least 2x retina sharpness for 100% quality
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // --- 2. Professional Lighting (Liquid Glass Theme) ---
  const ambientLight = new THREE.AmbientLight(0xffffff, Math.PI);
  scene.add(ambientLight);

  // Key light
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
  keyLight.position.set(5, 5, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  // Fill light
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
  fillLight.position.set(-5, 5, 8);
  scene.add(fillLight);

  // Specular rim light (creates highlights on edges during rotation)
  const rimLight = new THREE.DirectionalLight(0xffffff, 1.0);
  rimLight.position.set(0, -5, 5);
  scene.add(rimLight);

  // Point light for shiny sparkles
  const sparkleLight = new THREE.PointLight(0xffffff, 1.5, 15);
  sparkleLight.position.set(0, 2, 4);
  scene.add(sparkleLight);

  // --- 3. Physics Simulation (Verlet Integration) ---
  // We represent the lanyard as 5 rope joints, and the card center as a 6th joint.
  const damping = 0.985;
  const gravityRope = -45.0;
  const gravityCard = -70.0; // heavier card to keep ribbon taut
  const L_rope = 0.95;       // segment length (releasing more thread to hang lower)
  const L_card = 2.65;       // length from top joint (p4) to card center (p5)
  const solverIterations = 15;

  const p = [];
  const prev = [];
  
  // Initialize nodes horizontally as in R3F code
  const initialPositions = [
    new THREE.Vector3(0, 3.8, 0),        // p0: Pinned Anchor
    new THREE.Vector3(0.4, 3.8, 0),      // p1
    new THREE.Vector3(0.8, 3.8, 0),      // p2
    new THREE.Vector3(1.2, 3.8, 0),      // p3
    new THREE.Vector3(1.6, 3.8, 0),      // p4: Joint connected to clip
    new THREE.Vector3(1.6, 3.8 - L_card, 0) // p5: Card Center of Mass
  ];

  for (let i = 0; i < 6; i++) {
    p.push(initialPositions[i].clone());
    prev.push(initialPositions[i].clone());
  }

  // --- 4. Ribbon/Lanyard Mesh Creation ---
  // Create a CatmullRom spline through the rope joints p0..p4
  const curve = new THREE.CatmullRomCurve3([p[0], p[1], p[2], p[3], p[4]]);
  curve.curveType = 'chordal';
  
  const textureLoader = new THREE.TextureLoader();
  const ribbonTexture = textureLoader.load(getAssetPath('bandd.png') + '?v=' + Date.now(), (texture) => {
    texture.generateMipmaps = false;
    texture.anisotropy = 16;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  });
  ribbonTexture.wrapS = THREE.ClampToEdgeWrapping;
  ribbonTexture.wrapT = THREE.ClampToEdgeWrapping;
  
  const ribbonMaterial = new THREE.MeshBasicMaterial({
    map: ribbonTexture,
    side: THREE.DoubleSide
  });

  // Helper function to create a flat ribbon geometry following a 3D curve
  function createRibbonGeometry(curve, width) {
    const points = curve.getPoints(40); // 40 segments for nice curves
    const vertices = [];
    const uvs = [];
    const indices = [];
    const halfWidth = width / 2;
    const repeatX = 1.0; // Spans the full strap length once at 100% native HD resolution without repeating/blurring

    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      let tangent;
      if (i < points.length - 1) {
        tangent = points[i+1].clone().sub(curr).normalize();
      } else {
        tangent = curr.clone().sub(points[i-1]).normalize();
      }

      // Calculate side vector perpendicular to tangent and screen/Z-axis
      const side = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 0, 1)).normalize();

      const pLeft = curr.clone().addScaledVector(side, halfWidth);
      const pRight = curr.clone().addScaledVector(side, -halfWidth);

      vertices.push(pLeft.x, pLeft.y, pLeft.z);
      vertices.push(pRight.x, pRight.y, pRight.z);

      const t = i / (points.length - 1);
      // Map texture X-axis (U) along ribbon length, and Y-axis (V) across ribbon width
      uvs.push(t * repeatX, 0);
      uvs.push(t * repeatX, 1);

      if (i < points.length - 1) {
        const idx = i * 2;
        indices.push(idx, idx + 1, idx + 2);
        indices.push(idx + 1, idx + 3, idx + 2);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }

  let ribbonGeometry = createRibbonGeometry(curve, 0.35); // 0.35 width for beautiful strap
  const ribbonMesh = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
  scene.add(ribbonMesh);

  // --- 5. 3D Card Group & Model Loading ---
  const cardObjectGroup = new THREE.Group();
  scene.add(cardObjectGroup);

  let cardMesh = null;
  const gltfLoader = new THREE.GLTFLoader();

  const cardTexture = textureLoader.load(getAssetPath('card_texture.png') + '?v=' + Date.now(), (texture) => {
    texture.generateMipmaps = false;
    texture.anisotropy = 16;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.flipY = true;
    texture.repeat.set(1, 1 / 0.757248);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
  });

  gltfLoader.load(getAssetPath('kartu.glb'), (gltf) => {
    const model = gltf.scene;

    const cardMat = new THREE.MeshBasicMaterial({
      map: cardTexture,
      side: THREE.DoubleSide
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xdddddd,
      metalness: 0.9,
      roughness: 0.15
    });

    model.traverse((child) => {
      if (child.isMesh) {
        if (child.name === 'card') {
          child.material = cardMat;
          cardMesh = child; // Keep reference for raycasting
        } else if (child.name === 'clip' || child.name === 'clamp') {
          child.material = metalMat;
        }
      }
    });

    // Scale and pivot offset matching React code
    // Scale and pivot offset
    model.scale.set(2.7, 2.7, 2.7);
    model.position.set(0.47, -0.54, -0.982853);

    cardObjectGroup.add(model);
  }, undefined, (error) => {
    console.error('Error loading kartu.glb:', error);
  });

  // --- 6. Interactivity & Drag-and-Drop ---
  let isDragged = false;
  let isHovered = false;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const dragOffset = new THREE.Vector3();
  const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const intersectPoint = new THREE.Vector3();

  // Helper to update mouse coordinates in NDC
  function updateMouseCoords(e) {
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  }

  function onPointerDown(e) {
    updateMouseCoords(e);
    raycaster.setFromCamera(mouse, camera);

    if (cardMesh) {
      const intersects = raycaster.intersectObject(cardMesh, true);
      if (intersects.length > 0) {
        isDragged = true;
        
        // Find click position on the Z=0 plane (or card's depth plane)
        planeZ.constant = -p[5].z;
        raycaster.ray.intersectPlane(planeZ, intersectPoint);
        
        // Calculate offset from click point to card center (p5)
        dragOffset.copy(intersectPoint).sub(p[5]);
        
        container.style.cursor = 'grabbing';
        
        // Prevent scrolling on mobile during drag
        if (e.cancelable) e.preventDefault();
      }
    }
  }

  function onPointerMove(e) {
    updateMouseCoords(e);
    raycaster.setFromCamera(mouse, camera);

    if (isDragged) {
      // Prevent page scrolling while dragging the card
      if (e && e.cancelable) {
        e.preventDefault();
      }

      planeZ.constant = -p[5].z;
      if (raycaster.ray.intersectPlane(planeZ, intersectPoint)) {
        p[5].copy(intersectPoint).sub(dragOffset);
      }
      
      // Wake up physics particles
      for (let i = 1; i <= 5; i++) {
        p[i].z = THREE.MathUtils.clamp(p[i].z, -2, 2); // limit depth flinging
      }
    } else if (cardMesh) {
      // Handle hover cursor
      const intersects = raycaster.intersectObject(cardMesh, true);
      if (intersects.length > 0) {
        if (!isHovered) {
          isHovered = true;
          container.style.cursor = 'grab';
        }
      } else {
        if (isHovered) {
          isHovered = false;
          container.style.cursor = 'auto';
        }
      }
    }
  }

  function onPointerUp() {
    if (isDragged) {
      isDragged = false;
      container.style.cursor = isHovered ? 'grab' : 'auto';
    }
  }

  // Event listeners for both desktop and mobile
  container.addEventListener('mousedown', onPointerDown, { passive: false });
  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('mouseup', onPointerUp, { passive: true });

  container.addEventListener('touchstart', onPointerDown, { passive: false });
  window.addEventListener('touchmove', onPointerMove, { passive: false });
  window.addEventListener('touchend', onPointerUp, { passive: true });

  // --- 7. Animation Loop with Performance Optimization ---
  let isVisible = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
    });
  }, { threshold: 0.1 });
  observer.observe(container);

  let lastTime = performance.now();
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    if (!isVisible) return; // Skip rendering/physics calculation if scrolled out of view

    const time = performance.now();
    let dt = clock.getDelta();
    if (dt > 0.1) dt = 0.1; // clamp delta time to prevent physics explosion

    // --- Physics Verlet Update ---
    for (let i = 1; i <= 5; i++) {
      if (i === 5 && isDragged) continue; // skip verlet update for card center if user is dragging it

      const temp = p[i].clone();
      const vel = p[i].clone().sub(prev[i]);

      p[i].addScaledVector(vel, damping);

      const g = (i === 5) ? gravityCard : gravityRope;
      p[i].y += g * dt * dt;

      prev[i].copy(temp);
    }

    // --- Constraints Solver ---
    for (let iter = 0; iter < solverIterations; iter++) {
      // Pinned Anchor is fixed at initial position
      p[0].copy(initialPositions[0]);

      // Rope length constraints (p0 - p4)
      for (let i = 0; i < 4; i++) {
        const pA = p[i];
        const pB = p[i+1];
        const delta = pB.clone().sub(pA);
        const dist = delta.length();
        const diff = L_rope - dist;
        const percent = (diff / dist) * 0.5;
        const offset = delta.multiplyScalar(percent);

        if (i === 0) {
          pB.add(offset.multiplyScalar(2.0)); // p0 is fixed, so push p1 twice as much
        } else {
          pA.sub(offset);
          pB.add(offset);
        }
      }

      // Card lanyard attachment constraint (p4 - p5)
      const pA = p[4];
      const pB = p[5];
      const delta = pB.clone().sub(pA);
      const dist = delta.length();
      const diff = L_card - dist;
      const percent = (diff / dist) * 0.5;
      const offset = delta.multiplyScalar(percent);

      if (isDragged) {
        pA.sub(offset.multiplyScalar(2.0)); // p5 is fixed to cursor, push p4 twice as much
      } else {
        pA.sub(offset);
        pB.add(offset);
      }
    }

    // --- Card Rotation & Orientation ---
    // Position card at p5 (the card center point)
    cardObjectGroup.position.copy(p[5]);

    // Calculate rotation: card's local up vector (0, 1, 0) should align with p4 - p5.
    // The card's forward face (0, 0, 1) should align with camera view direction.
    // We flip the right and forward vectors (using camDir x up instead of up x camDir)
    // so the front face of the card is visible first!
    const up = p[4].clone().sub(p[5]).normalize();
    const camDir = new THREE.Vector3(0, 0, 1);
    const right = new THREE.Vector3().crossVectors(camDir, up).normalize();
    const forward = new THREE.Vector3().crossVectors(right, up).normalize();

    const matrix = new THREE.Matrix4().makeBasis(right, up, forward);
    
    // Smooth out card rotation around Y axis (faces forward, damp spin)
    cardObjectGroup.quaternion.setFromRotationMatrix(matrix);

    // --- Lanyard Ribbon Update ---
    const ribbonGeom = createRibbonGeometry(curve, 0.35);
    ribbonMesh.geometry.dispose();
    ribbonMesh.geometry = ribbonGeom;

    // Render Scene
    renderer.render(scene, camera);
  }

  // --- 8. Responsive Design Resize Handler ---
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.max(window.devicePixelRatio || 1, 2));
  }, { passive: true });

  // --- Interactive Hover & Click Handler (Opens Instagram ONLY when clicking Follow button area) ---
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Highlight & pointer cursor ONLY when hovering Follow button area at bottom right
    if (y > rect.height * 0.65 && x > rect.width * 0.45) {
      container.style.cursor = 'pointer';
      cardObjectGroup.scale.set(1.03, 1.03, 1.03);
    } else {
      container.style.cursor = 'grab';
      cardObjectGroup.scale.set(1.0, 1.0, 1.0);
    }
  });

  container.addEventListener('mouseleave', () => {
    container.style.cursor = 'default';
    cardObjectGroup.scale.set(1.0, 1.0, 1.0);
  });

  container.addEventListener('click', (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // ONLY open Instagram when clicking on the Follow button area at bottom right
    if (y > rect.height * 0.65 && x > rect.width * 0.45) {
      cardObjectGroup.scale.set(0.93, 0.93, 0.93);
      setTimeout(() => {
        cardObjectGroup.scale.set(1.0, 1.0, 1.0);
      }, 150);

      window.open('https://www.instagram.com/hannu_7_/', '_blank', 'noopener,noreferrer');
    }
  });

  // Start the animation loop
  animate();
});
