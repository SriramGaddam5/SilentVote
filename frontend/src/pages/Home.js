import { Text, VStack, HStack, SlideFade } from "@chakra-ui/react";
import { useEffect, useMemo, useState, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { LuVote } from "react-icons/lu";
import { IoShieldOutline } from "react-icons/io5";
import { loadSlim } from "@tsparticles/slim";
import InfoCard from "../components/InfoCard";
import { useInViewport } from "react-in-viewport";
import "../styles/Home.css";

function Home() {
  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    console.log(container);
  };

  const ref = useRef(null);
  const { enterCount } = useInViewport(
    ref,
    { rootMargin: "-300px" },
    { disconnectOnLeave: false },
    {}
  );

  const options = useMemo(
    () => ({
      fullScreen: {
        enable: false,
        zIndex: 0,
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onHover: {
            enable: true,
            mode: "repulse",
            parallax: {
              enable: false,
              force: 60,
              smooth: 10,
            },
          },
          onClick: {
            enable: true,
            mode: "push",
          },
          resize: true,
        },
        modes: {
          bubble: {
            distance: 30,
            size: 20,
            duration: 2,
            opacity: 1,
            speed: 2,
          },
          push: {
            particles_nb: 1,
          },
        },
      },
      backgroundMask: {
        enable: true,
        cover: {
          color: {
            value: {
              r: 0,
              g: 0,
              b: 0,
            },
          },
          opacity: 1,
        },
      },
      retina_detect: true,
      fps_limit: 60,
      background: {
        image:
          "url('https://img.freepik.com/premium-vector/polygon-abstract-polygonal-geometric-triangle-background_212889-4821.jpg?semt=ais_hybrid')",
      },
      particles: {
        color: {
          value: "#4a1772",
        },
        links: {
          color: "#9333ea",
          distance: 150,
          enable: true,
          opacity: 1,
          width: 2,
        },
        move: {
          enable: true,
          speed: { min: 1, max: 3 },
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
        number: {
          value: 200,
          limit: 300,
          density: {
            enable: true,
            value_area: 800,
          },
        },
        opacity: {
          value: 0,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0,
            sync: false,
          },
        },
        shape: {
          type: "circle",
          stroke: {
            width: 1,
            color: "#ffffff",
          },
        },
        size: {
          value: { min: 1, max: 5 },
          random: true,
          anim: {
            enable: true,
            speed: 10,
            size_min: 1,
            sync: false,
          },
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (init) {
    return (
      <div id="Body">
        <Particles
          id="particles"
          particlesLoaded={particlesLoaded}
          options={options}
        />
        <VStack>
          <SlideFade in={enterCount > 0} direction="left" offsetX="-100px">
            <Text
              id="title"
              ref={ref}
              bgGradient="linear(to-b, purple.200, purple.900)"
              bgClip="text"
              fontSize="100"
              mt={10}
            >
              silent Vote
            </Text>
          </SlideFade>

          <SlideFade in={enterCount > 0} direction="right" offsetX="100px">
            <Text
              ref={ref}
              bgGradient="linear(to-t, purple.300, purple.500)"
              bgClip="text"
              fontSize="50"
              mt={10}
            >
              Decentralized anonymous voting
            </Text>
            <LuVote id="slide-right" size={100} />
          </SlideFade>
          <HStack gap={20}>
            <InfoCard
              imageSrc="/images/Anonymous.svg"
              imageWidth={200}
              imageHeight={200}
              imageAlt="Learning image"
              cardTitle="Tell Silent Vote about yourself"
              cardDescription="Get started with Silent Vote here"
              cardLink="/data"
            />
            <InfoCard
              imageSrc="/images/Shield.svg"
              imageWidth={200}
              imageHeight={200}
              imageAlt="Learning image"
              cardTitle="Start learning"
              cardDescription="Learn more about finance"
              cardLink="/learn"
            />
            <InfoCard
              imageSrc="/images/Vote.svg"
              imageWidth={200}
              imageHeight={200}
              imageAlt="About image"
              cardTitle="About us"
              cardDescription="Learn more about Silent Vote"
              cardLink="/about"
            />
          </HStack>
        </VStack>
      </div>
    );
  }
}

export default Home;
