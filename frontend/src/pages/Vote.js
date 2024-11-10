import { useEffect, useState } from "react";
import responses from "../backend/responses.json"; // Adjust path as needed
import candidatesData from "../backend/candidates.json"; // Import candidates data
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
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [valid, setValid] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Load candidates from candidates.json into the dropdown
  useEffect(() => {
    setCandidates(candidatesData.candidates.map((candidate) => candidate.name));
  }, []);

  // Check if the form input is valid and if the user and candidate are eligible
  useEffect(() => {
    if (firstName && lastName && selectedCandidate) {
      // Find the voter in the responses data
      const voter = responses.responses.find(
        (person) =>
          person.firstName === firstName && person.lastName === lastName
      );

      // Check if the selected candidate is in the list of eligible candidates
      const isCandidateValid = candidates.includes(selectedCandidate);

      // Set `valid` to true if the voter exists, hasn't voted, and the candidate is valid
      if (voter && !voter.voted && isCandidateValid) {
        setValid(true);
      } else {
        setValid(false);
      }
    } else {
      setValid(false); // If any required field is missing, set `valid` to false
    }
  }, [firstName, lastName, selectedCandidate, candidates]);

  // Event handler for voting
  const handleVote = () => {
    const promise = new Promise((resolve, reject) => {
      setLoading(true);

      // Find the voter in responses.json and mark them as voted
      const voterIndex = responses.responses.findIndex(
        (person) =>
          person.firstName === firstName && person.lastName === lastName
      );

      // Find the selected candidate in candidates.json and increment their vote count
      const candidateIndex = candidatesData.candidates.findIndex(
        (candidate) => candidate.name === selectedCandidate
      );

      if (voterIndex !== -1 && candidateIndex !== -1) {
        // Mark the voter as having voted
        responses.responses[voterIndex].voted = true;

        // Increment the vote count for the selected candidate
        candidatesData.candidates[candidateIndex].votes += 1;

        // Simulate a successful vote
        setSuccess(true);

        setTimeout(() => {
          setLoading(false);
          resolve();
          toast({
            title: "Vote encrypted!",
            description: "Vote recorded successfully.",
            status: "success",
            variant: "subtle",
          });
        }, 2000);
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
    });

    toast.promise(promise, {
      loading: {
        title: "Encrypting vote",
        description: "Please wait...",
        variant: "subtle",
      },
    });
  };

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
                Encrypting vote, please wait...
              </Text>
            </VStack>
          )}
        </VStack>
      </Flex>
    </div>
  );
}

export default Vote;
