// import type { NextPage } from 'next'
// import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'

import { Canvas, useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import { ConeGeometry, EdgesGeometry, Matrix4, Vector3 } from "three";

const Flock = ({ count }) => {
  const group = useRef();

  return (
    <group ref={group} name="flock" dispose={null}>
      {[...Array(count)].map((value, index) => {
        const mass = 1 + Math.random();
        const visibility = 50 + 10 * mass;
        const velocity = new Vector3(
          1,
          Math.random() - 0.5,
          (Math.random() - 0.5) * 2
        );
        const speed = 1 * mass;
        return (
          <Boid
            key={index}
            index={index}
            position={[-200, Math.random() * 30, 100]}
            userData={{
              mass,
              visibility,
              velocity,
              speed,
            }}
          />
        );
      })}
    </group>
  );
};

function Boid(props) {
  const edge = useMemo(
    () => new EdgesGeometry(new ConeGeometry(3, 8, 3), 0),
    []
  );
  const ref = useRef();
  const { index } = props;

  useFrame(() => {
    const { visibility, velocity, mass, speed } = ref.current.userData;
    const { position } = ref.current;
    const flock = ref.current.parent.children;
    const neighbours = [];

    // Find neighbours
    flock.forEach((boid, i) => {
      if (i !== index) {
        var squareDistance =
          Math.pow(boid.position.x - position.x, 2) +
          Math.pow(boid.position.y - position.y, 2) +
          Math.pow(boid.position.z - position.z, 2);

        if (squareDistance < Math.pow(visibility, 2)) {
          neighbours.push(i);
        }
      }
    });

    const force = new Vector3();
    const cohesion = new Vector3();
    const alignment = new Vector3();
    const separation = new Vector3();

    if (neighbours.length) {
      neighbours.forEach((neighbourIndex) => {
        cohesion.add(flock[neighbourIndex].position);
        alignment.add(flock[neighbourIndex].userData.velocity);

        const distance = position.distanceTo(flock[neighbourIndex].position);

        if (distance <= 40) {
          const offset = new Vector3()
            .add(position)
            .sub(flock[neighbourIndex].position);
          separation.add(offset.divideScalar(Math.max(1, distance / 5)));
        }
      });

      force.add(separation.divideScalar(neighbours.length).clampLength(0, 1));
      force.add(
        cohesion
          .divideScalar(neighbours.length)
          .sub(position)
          .clampLength(0, 0.2)
      );
      force.add(
        alignment
          .divideScalar(neighbours.length)
          .sub(velocity)
          .clampLength(0, 0.1)
      );
    }

    if (Math.abs(velocity.y) > 0) {
      force.add(new Vector3(0, -velocity.y, 0).clampLength(0, 0.05));
    }

    velocity.add(force.divideScalar(mass).clampLength(0, 1 / mass));
    velocity.clampLength(0.2, speed + 1);

    if (Math.abs(ref.current.position.z) > 200) {
      ref.current.position.z = -ref.current.position.z;
    }
    if (Math.abs(ref.current.position.y) > 100) {
      ref.current.position.y = -ref.current.position.y;
    }
    if (Math.abs(ref.current.position.x) > 200) {
      ref.current.position.x = -ref.current.position.x;
    }
    ref.current.position.x += velocity.x;
    ref.current.position.y += velocity.y;
    ref.current.position.z += velocity.z;
    ref.current.lookAt(
      new Vector3().addVectors(ref.current.position, velocity)
    );
  });

  return (
    <mesh {...props} ref={ref}>
      <lineSegments
        args={[edge]}
        matrixAutoUpdate={false}
        matrix={new Matrix4()
          .makeTranslation(0, -1, 0)
          .makeRotationX(Math.PI / 2)}
        scale={props.mass}
      >
        <lineBasicMaterial color="black" />
      </lineSegments>
    </mesh>
  );
}

const Home = () => {
  return (
    <div className="App">
      <Canvas
        style={{ height: "700px" }}
        camera={{
          fov: 75,
          position: [-100, 30, 100],
          rotateY: -Math.PI / 4,
          rotateZ: -Math.PI / 16,
          rotateX: -Math.PI / 16,
          type: "PerspectiveCamera",
        }}
      >
        <fog attach="fog" args={["white", 0, 400]} />
        <ambientLight />
        <pointLight position={[0, 100, 0]} intensity={2} />
        <Flock count={100} />
      </Canvas>
    </div>
  );
};

export default Home;
