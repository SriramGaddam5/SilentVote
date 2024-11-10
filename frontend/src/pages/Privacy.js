import { Heading, Text, HStack, Tooltip, Link, Box } from "@chakra-ui/react";

import "../styles/Privacy.css";

function Privacy() {
  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        Privacy Policy
      </Heading>
      <HStack my="10">
        <Text p="30px" fontSize={"xl"} color="white">
          This website does not collect any personal data. It does not use
          cookies. There is no tracking of any kind. The source code for this
          website is available on{" "}
          <Tooltip label="Check out the GitHub" rounded="lg">
            <Link
              href="https://github.com/SriramGaddam5/SilentVote"
              isExternal
              color="purple.400"
              _hover={{ color: "purple.300" }}
              _active={{ color: "purple.200" }}
            >
              GitHub
            </Link>
          </Tooltip>
          .
        </Text>
      </HStack>
    </div>
  );
}

export default Privacy;
