import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function TransactionGraph3D({ onSelectNode }) {
  const mountRef = useRef(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth || 600;
    const height = currentMount.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Nodes Data
    const nodes = [
      { id: "TXN-QF-001", type: "TRANSACTION", label: "TXN-QF-001 (₹85,000)", pos: [0, 0, 0], color: 0xEF4444, risk: "HIGH RISK" },
      { id: "USR-9901", type: "USER", label: "User USR-9901", pos: [-3, 2, 1], color: 0x10B981, risk: "LEGIT" },
      { id: "DEV-9901", type: "DEVICE", label: "Device DEV-9901", pos: [3, 1, -1], color: 0xF59E0B, risk: "SUSPICIOUS" },
      { id: "MERCH-8802", type: "MERCHANT", label: "Merchant MERCH-8802", pos: [2, -2.5, 0.5], color: 0xEF4444, risk: "HIGH RISK" },
      { id: "IP-192-168-1", type: "IP", label: "IP 192.168.1.105", pos: [-2.5, -2, -1], color: 0x06B6D4, risk: "LEGIT" },
      { id: "USR-9902", type: "USER", label: "User USR-9902", pos: [4.5, 2.5, 0], color: 0xEF4444, risk: "HIGH RISK" },
      { id: "NODE-CMD", type: "COMMAND_POST", label: "Command Post Egress", pos: [0, 4, -2], color: 0x8B5CF6, risk: "CORE" }
    ];

    // Node Meshes
    const nodeMeshes = [];
    const sphereGeo = new THREE.SphereGeometry(0.4, 24, 24);

    nodes.forEach(n => {
      const mat = new THREE.MeshPhongMaterial({
        color: n.color,
        emissive: n.color,
        emissiveIntensity: 0.3,
        shininess: 80
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(...n.pos);
      mesh.userData = n;
      scene.add(mesh);
      nodeMeshes.push(mesh);
    });

    // Edges
    const edges = [
      [0, 1], [0, 2], [0, 3], [0, 4], [2, 5], [1, 6], [3, 5]
    ];

    const lineMat = new THREE.LineBasicMaterial({ color: 0x8B5CF6, transparent: true, opacity: 0.5 });

    edges.forEach(([i, j]) => {
      const points = [
        new THREE.Vector3(...nodes[i].pos),
        new THREE.Vector3(...nodes[j].pos)
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
    });

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x06B6D4, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Raycaster for Picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(nodeMeshes);

      if (intersects.length > 0) {
        const hitNode = intersects[0].object.userData;
        setSelectedNodeInfo(hitNode);
        if (onSelectNode) onSelectNode(hitNode);

        // Smooth camera move to target node
        const targetPos = intersects[0].object.position;
        camera.position.set(targetPos.x, targetPos.y, targetPos.z + 5);
        camera.lookAt(targetPos);
      }
    };

    renderer.domElement.addEventListener("click", handleClick);

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      
      // Gentle node pulsing & scene rotation
      scene.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      renderer.domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "360px", position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      {selectedNodeInfo && (
        <div style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          background: "rgba(15, 23, 42, 0.85)",
          border: "1px solid #06B6D4",
          borderRadius: "8px",
          padding: "8px 14px",
          fontSize: "12px",
          backdropFilter: "blur(8px)"
        }}>
          <b>Selected:</b> {selectedNodeInfo.label} | <span style={{ color: selectedNodeInfo.risk === "HIGH RISK" ? "#EF4444" : "#10B981" }}>{selectedNodeInfo.risk}</span>
        </div>
      )}
    </div>
  );
}
