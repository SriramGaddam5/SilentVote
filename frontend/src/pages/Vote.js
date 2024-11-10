import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Spacer,
  VStack,
  Text,
  Input,
  Select,
  Button,
  useToast,
  FormControl,
  GridItem,
  FormLabel,
} from "@chakra-ui/react";
import { GiNestedHexagons } from "react-icons/gi";
import "../styles/Vote.css";

function Vote() {
  // State variables
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [candidates, setCandidates] = useState([
    "Alice",
    "Bob",
    "Charlie",
    "David",
  ]);
  const [selectedCandidate, setSelectedCandidate] = useState("");

  const [valid, setValid] = useState(false);

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get the candidates from the backend
  // useEffect(() => {
  //   fetch("http://localhost:5000/candidates")
  //     .then((response) => response.json())
  //     .then((data) => setCandidates(data.candidates));
  // }, []);

  // Validate the form input
  if (!valid) {
    if (firstName && lastName && selectedCandidate) {
      setValid(true);
    }
  }

  if (valid) {
    if (!firstName || !lastName || !selectedCandidate) {
      setValid(false);
    }
  }

  // Event handlers
  const handleVote = () => {
    // Create a promise that resolves in 5s
    const promise = new Promise((resolve, reject) => {
      setLoading(true);

      // Send the vote to the backend
      // fetch("http://localhost:5000/vote", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     firstName,
      //     lastName,
      //     selectedCandidate,
      //   }),
      // });

      // Simulate a successful vote
      setSuccess(true);

      // Simulate a unsuccessful vote
      // setSuccess(false);

      setTimeout(() => {
        if (success) {
          setLoading(false);
          resolve();
        } else {
          setLoading(false);
          reject(); // Reject the promise
        }
      }, 10000);
    });

    // Will display the loading toast until the promise is either resolved or rejected.
    toast.promise(promise, {
      success: {
        title: "Vote encrypted!",
        description: "Vote sent to bulletin board",
        variant: "subtle",
      },
      error: {
        title: "Vote rejected",
        description: "Something went wrong :(",
        variant: "subtle",
      },
      loading: {
        title: "Encrypting vote",
        description: "Please wait...",
        variant: "subtle",
      },
    });
  };

  const toast = useToast();

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

  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        Vote
      </Heading>
      {/* Form input */}

      <Flex p={20} w="auto" justifyContent="center" alignItems="center">
        <VStack>
          <Box
            shadow="xl"
            bg="gray.800"
            px={8}
            py={5}
            mx="auto"
            rounded="3xl"
            w="xl"
          >
            {/* <FormControl as={GridItem} colSpan={[6, 3]}>
              <FormLabel
                htmlFor="first_name"
                fontSize="sm"
                fontWeight="md"
                color="gray.700"
                _dark={{ color: "gray.50" }}
              >
                First name
              </FormLabel>
              <Input
                type="text"
                name="first_name"
                id="first_name"
                autoComplete="given-name"
                mt={1}
                focusBorderColor="brand.400"
                shadow="sm"
                size="sm"
                w="full"
                rounded="md"
              />
            </FormControl>

            <FormControl as={GridItem} colSpan={[6, 3]}>
              <FormLabel
                htmlFor="last_name"
                fontSize="sm"
                fontWeight="md"
                color="gray.700"
                _dark={{ color: "gray.50" }}
              >
                Last name
              </FormLabel>
              <Input
                type="text"
                name="last_name"
                id="last_name"
                autoComplete="family-name"
                mt={1}
                focusBorderColor="brand.400"
                shadow="sm"
                size="sm"
                w="full"
                rounded="md"
              />
            </FormControl> */}

            <VStack px="10px" pt="10px" color="white">
              <FormControl mb="10">
                <FormLabel fontSize={"xl"}>First name</FormLabel>
                <Input
                  placeholder="Type your first name here"
                  variant="flushed"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </FormControl>
              <FormControl mb="10">
                <FormLabel fontSize={"xl"}>Last name</FormLabel>
                <Input
                  placeholder="Type your last name here"
                  variant="flushed"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormControl>
              <FormControl mb="10">
                <FormLabel fontSize={"xl"}>Candidate</FormLabel>
                <Select
                  placeholder="Select candidate"
                  value={selectedCandidate}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  color="black"
                  bg="white"
                >
                  {candidates.map((candidate) => (
                    <option key={candidate} value={candidate}>
                      {candidate}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Button
                colorScheme="purple"
                isDisabled={!valid}
                onClick={handleVote}
              >
                Vote
              </Button>
              <br />
            </VStack>
          </Box>

          {loading && (
            <VStack mt={10}>
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
            </VStack>
          )}
        </VStack>
      </Flex>
    </div>
  );
}

export default Vote;
