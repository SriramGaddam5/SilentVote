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
            href="/vote"
            _hover={{ color: "purple.500", transform: "scale(0.99)" }}
            _active={{ color: "purple.400", transform: "scale(1.01)" }}
          >
            Vote
          </Link>
        </Tooltip>
        <Spacer />
        <Tooltip label="View bulletin board" rounded="lg">
          <Link
            href="/progress"
            _hover={{ color: "purple.500", transform: "scale(0.99)" }}
            _active={{ color: "purple.400", transform: "scale(1.01)" }}
          >
            Progress
          </Link>
        </Tooltip>
        <Spacer />
        <Tooltip label="View voting results" rounded="lg">
          <Link
            href="/results"
            _hover={{ color: "purple.500", transform: "scale(0.99)" }}
            _active={{ color: "purple.400", transform: "scale(1.01)" }}
          >
            Results
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
