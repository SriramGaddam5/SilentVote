import { Text, VStack, HStack, SlideFade } from "@chakra-ui/react";
import { useEffect, useMemo, useState, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { LuPiggyBank } from "react-icons/lu";
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
            mode: "bubble",
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
              r: 255,
              g: 255,
              b: 255,
            },
          },
          opacity: 1,
        },
      },
      retina_detect: true,
      fps_limit: 60,
      background: {
        image:
          "url('https://static.vecteezy.com/system/resources/thumbnails/001/217/366/small/polygonal-blue-background.jpg')",
      },
      particles: {
        color: {
          value: "#B8E5FA",
        },
        links: {
          color: "#2B3990",
          distance: 150,
          enable: true,
          opacity: 1,
          width: 1,
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
              bgGradient="linear(to-r, blue.200, blue.900)"
              bgClip="text"
              fontSize="100"
              fontWeight="extrabold"
              mt={10}
            >
              Silent Vote
            </Text>
          </SlideFade>

          <SlideFade in={enterCount > 0} direction="right" offsetX="100px">
            <Text
              ref={ref}
              bgGradient="linear(to-r, blue.200, blue.900)"
              bgClip="text"
              fontSize="50"
              fontWeight="extrabold"
              mt={10}
            >
              Anonymous voting
            </Text>
            <LuPiggyBank id="slide-right" size={100} />
          </SlideFade>
          <HStack gap={20}>
            <InfoCard
              imageSrc="/images/Minnow.svg"
              imageWidth={200}
              imageHeight={200}
              imageAlt="Learning image"
              cardTitle="Tell Silent Vote about yourself"
              cardDescription="Get started with Silent Vote here"
              cardLink="/data"
            />
            <InfoCard
              imageSrc="/images/Piggy bank.svg"
              imageWidth={200}
              imageHeight={200}
              imageAlt="Learning image"
              cardTitle="Start learning"
              cardDescription="Learn more about finance"
              cardLink="/learn"
            />
            <InfoCard
              imageSrc="/images/Shark fin.svg"
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
