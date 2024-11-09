import { Heading, HStack, Text } from "@chakra-ui/react";
import "../styles/Error.css";

function Error() {
  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        Error
      </Heading>
      <HStack p="30px" spacing="5px">
        <Text color="red.500">{window.location.pathname}</Text>
        <Text color="white">not found</Text>
      </HStack>
    </div>
  );
}

export default Error;
