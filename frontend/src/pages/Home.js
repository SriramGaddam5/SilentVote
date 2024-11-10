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
import { GiNestedHexagons } from "react-icons/gi";
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

  // Calculate how long the user has been on the page, format variable as string MM:SS with leading zeros
  const [timeOnPage, setTimeOnPage] = useState("00:00");
  useEffect(() => {
    const interval = setInterval(() => {
      let [minutes, seconds] = timeOnPage.split(":").map(Number);
      seconds += 1;
      if (seconds === 60) {
        seconds = 0;
        minutes += 1;
      }
      setTimeOnPage(
        `${minutes < 10 ? "0" + minutes : minutes}:${
          seconds < 10 ? "0" + seconds : seconds
        }`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [timeOnPage]);

  // Add a random message from an array that periodically appears on the page
  // Add a fade effect between messages
  const [randomMessage, setRandomMessage] = useState("");
  useEffect(() => {
    const messages = [
      "Vote securely and anonymously",
      "Encrypting your vote",
      "Ensuring your privacy",
      "This may take a while",
      "Please wait",
      "Loading...",
      "Your vote is important",
      "Thanks for voting",
      "Thanks for using Silent Vote",
      "Thanks for your patience",
      "2024 TAMU Datathon",
    ];
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * messages.length);
      setRandomMessage(messages[randomIndex]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
                      that allows you to vote securely and anonymously. Start
                      voting today and start voting securely.
                    </chakra.p>
                    <Button
                      as="a"
                      variant="solid"
                      w={{ base: "full", sm: "auto" }}
                      colorScheme="purple"
                      size="lg"
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
                    <Feature>Anonymous voting</Feature>
                    <Feature>Decentralized voting</Feature>
                    <Feature>Zero-knowledge technology with ZK Snarks</Feature>
                    <Feature>Blockchain technology</Feature>
                    <Feature>Secure voting</Feature>
                    <Feature>Private voting</Feature>
                    <Feature>Confidential voting</Feature>
                    <Feature>Secure data protection</Feature>
                    <Feature>Confidential data protection</Feature>
                    <Feature>Private data protection</Feature>
                    <Feature>Zero-knowledge data protection</Feature>
                    <Feature>Smart contracts</Feature>
                  </VStack>
                </SimpleGrid>
              </Box>
            </Flex>
          </SlideFade>

          <GiNestedHexagons id="loader" size={100} />
          {/* Display time spent on page */}
          <Text color="white" fontSize="lg">
            {timeOnPage}
          </Text>

          {/* Display a random message */}
          <Text
            id="loadingMessage"
            bgClip="text"
            fontSize="lg"
            fontWeight="bold"
            rounded="full"
            px={2}
            py={1}
          >
            {randomMessage}
          </Text>

          <HStack gap={20} mb={20}>
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
