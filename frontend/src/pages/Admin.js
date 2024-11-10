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
import "../styles/Admin.css";

function Admin() {
  // State variables
  const [voters, setVoters] = useState([
    "Unknown voter 1",
    "Unknown voter 2",
    "Unknown voter 3",
  ]);
  const [voted, setVoted] = useState([true, true, false]);

  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        Admin
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

export default Admin;
