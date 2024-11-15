import { useState } from "react";
import responses from "../backend/responses.json"; // Adjust path as needed
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
import "../styles/Progress.css";

function Progress() {
  // State variables
  const [voters, setVoters] = useState(
    responses.responses.map(
      (person) => `${person.firstName} ${person.lastName}`
    )
  );
  const [voted, setVoted] = useState(
    responses.responses.map((person) => `${person.voted}`)
  );

  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        Progress
      </Heading>
      <VStack p="30px" spacing="20px" color="white">
        {/* Loop through table */}
        <TableContainer>
          <Table variant="simple">
            <TableCaption>Registered Voters</TableCaption>
            <Thead>
              <Tr>
                <Th>Voter</Th>
                <Th>Has Voted</Th>
              </Tr>
            </Thead>
            <Tbody>
              {voters.map((voter, index) => (
                <Tr key={index}>
                  <Td>{voter}</Td>
                  <Td>{voted[index] === "true" ? "Yes" : "No"}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>
    </div>
  );
}

export default Progress;
