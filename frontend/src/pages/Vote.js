import { useEffect, useState } from "react";
import responses from "../backend/responses.json"; // Adjust path as needed
import {
  Box,
  Flex,
  Heading,
  VStack,
  Text,
  Input,
  Select,
  Button,
  useToast,
  FormControl,
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
  const toast = useToast();

  // Check if the form input is valid and if the user is eligible to vote
  useEffect(() => {
    if (firstName && lastName && selectedCandidate) {
      // Find the voter in the responses data
      const voter = responses.responses.find(
        (person) =>
          person.firstName === firstName && person.lastName === lastName
      );

      // Set `valid` to true if the voter exists and hasn't already voted
      if (voter && !voter.voted) {
        setValid(true);
      } else {
        setValid(false);
      }
    } else {
      setValid(false); // If any required field is missing, set `valid` to false
    }
  }, [firstName, lastName, selectedCandidate]);

  // Event handler for voting
  const handleVote = () => {
    const promise = new Promise((resolve, reject) => {
      setLoading(true);

      // Here, you would send the vote to the backend if required
      // Example:
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

      setSuccess(true); // Simulate a successful vote

      setTimeout(() => {
        if (success) {
          setLoading(false);
          resolve();
          toast({
            title: "Vote encrypted!",
            description: "Vote sent to bulletin board",
            status: "success",
            variant: "subtle",
          });
        } else {
          setLoading(false);
          reject();
          toast({
            title: "Vote rejected",
            description: "Something went wrong :(",
            status: "error",
            variant: "subtle",
          });
        }
      }, 1000);
    });

    toast.promise(promise, {
      loading: {
        title: "Encrypting vote",
        description: "Please wait...",
        variant: "subtle",
      },
    });
  };

  // Time tracking for user session
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

  // Random messages display
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
              <Text color="white" fontSize="lg">
                {timeOnPage}
              </Text>
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
