import {
  Heading,
  Text,
  HStack,
  Image,
  Spacer,
  Center,
  Flex,
} from "@chakra-ui/react";
import { LuVote } from "react-icons/lu";

import "../styles/About.css";

function About() {
  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        About Us
      </Heading>
      <HStack my="10" p="30px">
        <Image src="/images/Vote.svg" w={300} />
        <Text p="30px" fontSize={"xl"} color="white">
          <Text fontSize={"2xl"} fontWeight={"bold"} color="purple.400">
            Silent Vote is a decentralized anonymous voting system.
          </Text>
          <br />
          <br />
          Currently, a voter has to provide identification to prove that they
          are qualified to vote and have not voted before. That identification
          may carry other information such as a home address, date of birth,
          proof of funds in a certain currency, or a simple attestation from a
          blockchain wallet that the voter might not want to reveal publicly.
          <br />
          <br />
          Blockchain technology provides infrastructure that reduces the
          opportunity for tampering. And with a DApp using Midnight’s
          zero-knowledge technology, voters or a decentralized autonomous
          organization (DAO) voting on behalf of its members can prove what they
          need to without disclosing unnecessary information. The implications
          are wide-ranging and profound.
          <br />
          <br />
          Midnight is a data protection blockchain that offers programmable data
          protection capabilities powered by zero-knowledge technology to
          address the delicate balance between data protection, ownership, and
          utilization. This ensures that developers can leverage blockchain
          technology without exposing confidential information or losing control
          over their data.
          <br />
          <br />
          To build on Midnight, all you need is familiarity with TypeScript or a
          similar JavaScript based library. The service is free to use and their
          developer documentation has all the information you need to get
          started.
        </Text>
      </HStack>
      <HStack>
        <Heading p="30px" color="gray.300">
          Our Mission
        </Heading>
        <Spacer />
        <Image src="/images/Anonymous.svg" w={300} pr="20" />
      </HStack>

      <Text p="30px" fontSize={"xl"} mb="10" color="white">
        <Text fontSize={"2xl"} fontWeight={"bold"} color="purple.400">
          Unblocking widespread adoption of the decentralized web
        </Text>
        <br />
        <br />
        Utility should not come at the expense of data protection and ownership.
        <br />
        <br />
        Silent Vote is bringing data protection to the blockchain - empowering
        organizations to deliver regulation-friendly, data-protecting
        applications that keep users in control of their own information.
        <br />
        <br />
        Harnessing the power of zero-knowledge technology, Silent Vote provides
        a platform for creating new business models that offer a radically
        different approach to handling data.
      </Text>
      <Center>
        <object
          data="/images/SilentVoteInfographics.pdf"
          type="application/pdf"
          width="75%"
          height="850px"
        >
          <p>
            Alternative text - include a link{" "}
            <a href="/images/SilentVoteInfographics.pdf">to the PDF!</a>
          </p>
        </object>
      </Center>
      <Center>
        <Text>
      <Text p="30px" fontSize={"xl"} mb="10" color="white">
        These 4 proofs effectively make elections more secure, anonymous, and trustworthy than physical ballot voting.
        Voter data is only ever stored on local machines so no data can be stolen in a data breach.
        All voters can be assured that election results aren't rigged or miscouned since they can verify it themselves.
        Even a spy eavesdropping on the connection will gain nothing.
        There is even an added feature that someone can prove they voted without revealing their vote, 
        something that is impossible to do efficiently with physical ballots.
        </Text>
        <br/>
        <br/>
        <Text fontSize={"2xl"} fontWeight={"bold"} color="purple.400">
        SilentVote and other blockchains with zero trust architecture are the future of all online transactions!    
        </Text>
        </Text>
      </Center>
      <Center>
        <LuVote size={100} />
      </Center>
    </div>
  );
}

export default About;
