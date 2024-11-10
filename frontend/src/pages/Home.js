import {
  Text,
  VStack,
  HStack,
  SlideFade,
  Flex,
  Icon,
  Box,
  SimpleGrid,
  Button,
  chakra,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
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
            mode: "repulse",
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

  const Feature = (props) => {
    return (
      <Flex>
        <Icon
          boxSize={5}
          mt={1}
          mr={2}
          color="white"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          ></path>
        </Icon>
        <chakra.p fontSize="lg" color="gray.400" {...props} />
      </Flex>
    );
  };

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
            The NextGen Voting Platform
            </Text>
          </SlideFade>

          <SlideFade in={enterCount > 0} direction="left" offsetX="-100px">
            <Flex p={20} w="auto" justifyContent="center" alignItems="center">
              <Box
                shadow="xl"
                bg="gray.800"
                px={8}
                py={20}
                mx="auto"
                rounded="3xl"
              >
                <SimpleGrid
                  alignItems="center"
                  columns={{ base: 1, lg: 2 }}
                  spacingY={{ base: 10, lg: 32 }}
                  spacingX={{ base: 10, lg: 24 }}
                >
                  <Box>
                    <chakra.h2
                      mb={3}
                      fontSize={{ base: "3xl", md: "4xl" }}
                      fontWeight="extrabold"
                      textAlign={{ base: "center", sm: "left" }}
                      lineHeight="shorter"
                      letterSpacing="tight"
                      bgGradient="linear(to-r, purple.500, purple.700)"
                      bgClip="text"
                    >
                      Secure and anonymous voting
                    </chakra.h2>
                    <chakra.p
                      mb={6}
                      fontSize={{ base: "lg", md: "xl" }}
                      textAlign={{ base: "center", sm: "left" }}
                      color="gray.500"
                    >
                      Silent Vote is a decentralized anonymous voting platform
                      that allows you to vote securely and efficiently. Start
                      voting today.
                    </chakra.p>
                    <Button
                      as="a"
                      variant="solid"
                      w={{ base: "full", sm: "auto" }}
                      colorScheme="purple"
                      size="lg"
                      href="/vote"
                    >
                      Vote Now
                    </Button>
                  </Box>
                  <VStack
                    direction="column"
                    flexGrow={1}
                    spacing={5}
                    alignItems="start"
                  >
                    <Feature>Decentralized Authentication</Feature>
                    <Feature>Non-Interactive Zero Knowledge Architecture</Feature>
                    <Feature>Distributed Blockchain Technology</Feature>
                    <Feature>Anonymous & Confidential Voting</Feature>
                    <Feature>Secure & Trustworthy Elections</Feature>
                    <Feature>Transparent & Digital Ballots</Feature>
                    <Feature>Efficient & Stable Platforms</Feature>
                  </VStack>
                </SimpleGrid>
              </Box>
            </Flex>
          </SlideFade>

          <HStack gap={20} mb={20}>
            <InfoCard
              imageSrc="/images/Vote.svg"
              imageWidth={200}
              imageHeight={200}
              imageAlt="Voting image"
              cardTitle="Vote now"
              cardDescription="Get started with Silent Vote here"
              cardLink="/vote"
            />
            <InfoCard
              imageSrc="/images/Shield.svg"
              imageWidth={200}
              imageHeight={200}
              imageAlt="Shield image"
              cardTitle="Progress panel"
              cardDescription="Check this election's progress"
              cardLink="/progress"
            />
            <InfoCard
              imageSrc="/images/Anonymous.svg"
              imageWidth={200}
              imageHeight={200}
              imageAlt="Anonymous image"
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
