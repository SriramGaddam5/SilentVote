import { useState } from "react";
import candidates from "../backend/candidates.json"; // Adjust path as needed
import {
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import "../styles/Results.css";

function Results() {
  // State variables
  const [candidatesList, setCandidatesList] = useState(candidates.candidates);

  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        Results
      </Heading>
      <VStack p="30px" spacing="20px" color="white">
        {/* Loop through table */}
        <TableContainer>
          <Table variant="simple">
            <TableCaption>Election Results</TableCaption>
            <Thead>
              <Tr>
                <Th>Candidate</Th>
                <Th>Votes</Th>
              </Tr>
            </Thead>
            <Tbody>
              {candidatesList.map((candidate, index) => (
                <Tr key={index}>
                  <Td>{candidate.name}</Td>
                  {/* <Td>{candidate.votes}</Td>
                   */}
                  <Td>{"NA"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </div>
  );
}

export default Results;
