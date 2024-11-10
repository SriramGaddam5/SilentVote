import { Flex, Link, Spacer, Text, Box, Tooltip } from "@chakra-ui/react";
import "../styles/Footer.css";
import { AiFillInstagram } from "react-icons/ai";
import { FaYoutube } from "react-icons/fa";

function Footer() {
  return (
    <div id="Footer">
      <Flex
        p={5}
        mt={10}
        bgGradient="linear(to-t, #110011, black)"
        color="white"
        gap="5"
        alignItems="center"
      >
        <Text p="1">© 2024 Silent Vote</Text>
        <Tooltip label="Check out the datathon Instagram!" rounded="lg">
          <Link href="https://www.instagram.com/tamudatathon/" isExternal>
            <AiFillInstagram size={25} />
          </Link>
        </Tooltip>
        <Tooltip
          label="Subscribe to the datathon YouTube channel!"
          rounded="lg"
        >
          <Link href="https://www.youtube.com/@tamudatathon23" isExternal>
            <FaYoutube size={25} />
          </Link>
        </Tooltip>
        <Spacer />
        <Spacer />
        <Tooltip label="Our Privacy Policy" rounded="lg">
          <Link href="/privacy" isExternal>
            <Text p="1">Privacy Policy</Text>
          </Link>
        </Tooltip>
        <Tooltip label="Check out the GitHub" rounded="lg">
          <Link href="https://github.com/SriramGaddam5/SilentVote" isExternal>
            <Box
              px="2"
              py="1"
              rounded="full"
              bg="white"
              color="purple.900"
              _hover={{ background: "purple.50", transform: "scale(0.99)" }}
              _active={{ background: "purple.100", transform: "scale(1.01)" }}
            >
              GitHub
            </Box>
          </Link>
        </Tooltip>
      </Flex>
    </div>
  );
}

export default Footer;
