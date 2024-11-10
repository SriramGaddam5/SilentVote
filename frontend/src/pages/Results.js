import { useState } from "react";
import {
  Heading,
  VStack,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
import "../styles/Results.css";

function Results() {
  // State variables
  const [voters, setVoters] = useState([]);
  const [voted, setVoted] = useState([]);

  // Get the voters in filepath /backend/responses.json

  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        Results
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
                  <Td>{voted[index] ? "Yes" : "No"}</Td>
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
