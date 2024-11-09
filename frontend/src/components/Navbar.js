import { Flex, Link, Spacer, Tooltip } from "@chakra-ui/react";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <div id="Navbar">
      <Flex
        px={20}
        py={5}
        color="white"
        fontWeight="bold"
        shadow="sm"
        bg="black"
      >
        <Spacer />
        <Tooltip label="Go back home" rounded="lg">
          <Link
            href="/"
            _hover={{ color: "purple.500", transform: "scale(0.99)" }}
            _active={{ color: "purple.400", transform: "scale(1.01)" }}
          >
            Home
          </Link>
        </Tooltip>
        <Spacer />
        <Tooltip label="Get started" rounded="lg">
          <Link
            href="/Data"
            _hover={{ color: "purple.500", transform: "scale(0.99)" }}
            _active={{ color: "purple.400", transform: "scale(1.01)" }}
          >
            Data
          </Link>
        </Tooltip>
        <Spacer />
        <Tooltip label="Ask Silent Vote any questions you have" rounded="lg">
          <Link
            href="/learn"
            _hover={{ color: "purple.500", transform: "scale(0.99)" }}
            _active={{ color: "purple.400", transform: "scale(1.01)" }}
          >
            Learn
          </Link>
        </Tooltip>
        <Spacer />
        <Tooltip label="Learn more about us" rounded="lg">
          <Link
            href="/about"
            _hover={{ color: "purple.500", transform: "scale(0.99)" }}
            _active={{ color: "purple.400", transform: "scale(1.01)" }}
          >
            About
          </Link>
        </Tooltip>
        <Spacer />
      </Flex>
    </div>
  );
}

export default Navbar;
