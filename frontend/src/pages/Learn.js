import {
  Heading,
  VStack,
  Text,
  Input,
  Button,
  Textarea,
} from "@chakra-ui/react";
import "../styles/Error.css";

function Learn() {
  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        Learn
      </Heading>
      <VStack p="30px" spacing="20px" color="white">
        <Text fontSize={"xl"}>Ask your questions here</Text>
        <Input placeholder="Type your question here" />
        <Button colorScheme="purple">Submit</Button>
        <br />
        <Textarea isDisabled placeholder="Output" />
      </VStack>
    </div>
  );
}

export default Learn;
