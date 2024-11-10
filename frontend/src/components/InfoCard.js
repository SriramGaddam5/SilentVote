import React, { useRef } from "react";
import {
  LinkBox,
  LinkOverlay,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  Tooltip,
  ScaleFade,
} from "@chakra-ui/react";
import { useInViewport } from "react-in-viewport";
import "../styles/InfoCard.css";

function InfoCard({
  imageSrc,
  imageWidth,
  imageHeight,
  imageAlt,
  cardTitle,
  cardDescription,
  cardLink,
}) {
  const ref = useRef(null);
  const { enterCount } = useInViewport(
    ref,
    { rootMargin: "-300px" },
    { disconnectOnLeave: false },
    {}
  );
  return (
    <div id="InfoCard">
      <ScaleFade
        initialScale={0.9}
        in={enterCount > 0}
        whileHover={{ scale: 1.01 }}
      >
        <Tooltip label={cardDescription} rounded="lg">
          <LinkBox
            maxW="sm"
            my={10}
            rounded="lg"
            shadow="xl"
            ref={ref}
            _active={{
              transform: "scale(1.01)",
              bgColor: "gray.800",
            }}
          >
            <HStack>
              <Image
                src={imageSrc}
                width={imageWidth}
                height={imageHeight}
                fallbackSrc="/images/Fallback.svg"
                alt={imageAlt}
                borderRadius="lg"
                p={5}
              />
              <VStack p={5}>
                <Heading
                  size="md"
                  my="2"
                  bgGradient="linear(to-r, purple.400, purple.500)"
                  bgClip="text"
                >
                  <LinkOverlay href={cardLink}>{cardTitle}</LinkOverlay>
                </Heading>
                <Text color="white">{cardDescription}</Text>
              </VStack>
            </HStack>
          </LinkBox>
        </Tooltip>
      </ScaleFade>
    </div>
  );
}

export default InfoCard;
