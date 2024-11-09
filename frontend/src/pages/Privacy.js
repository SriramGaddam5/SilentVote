import { Heading, Text, HStack } from "@chakra-ui/react";
import { LuVote } from "react-icons/lu";

import "../styles/Privacy.css";

function Privacy() {
  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        Privacy Policy
      </Heading>
      <HStack my="10">
        <Text p="30px" fontSize={"xl"} color="white">
          This website collects personal data such as financial data to power
          our LLM's responses
        </Text>
      </HStack>
      <LuVote id="slide-right" size={100} />
    </div>
  );
}

export default Privacy;
