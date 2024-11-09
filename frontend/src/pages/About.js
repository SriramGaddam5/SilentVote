import { Heading, Text, HStack, Image, Spacer, Center } from "@chakra-ui/react";
import { LuPiggyBank } from "react-icons/lu";
import { GrMoney } from "react-icons/gr";

import "../styles/About.css";

function About() {
  return (
    <div id="Body">
      <Heading p="30px" color="gray.300">
        About Us
      </Heading>
      <HStack my="10" p="30px">
        <Image src="/images/Dollar.svg" w={300} />
        <Text p="30px" fontSize={"xl"} color="white">
          Silent Vote is a platform intended to assist users with their
          financial journey. It utilizes an LLM that gives users advice based on
          their inputted financial data, making recommendations on savings,
          investments, income, and expenditures. The goal of our platform is to
          support financial literacy and lower the barrier of entry into the
          financial world. Currently, a voter has to provide identification to
          prove that they are qualified to vote and have not voted before. That
          identification may carry other information such as a home address,
          date of birth, proof of funds in a certain currency, or a simple
          attestation from a blockchain wallet that the voter might not want to
          reveal publicly. Blockchain technology provides infrastructure that
          reduces the opportunity for tampering. And with a DApp using
          Midnight’s zero-knowledge technology, voters or a decentralized
          autonomous organization (DAO) voting on behalf of its members can
          prove what they need to without disclosing unnecessary information.
          The implications are wide-ranging and profound.
        </Text>
      </HStack>
      <HStack>
        <Heading p="30px" color="gray.300">
          Our Mission
        </Heading>
        <Spacer />
        <Image src="/images/Minnow.svg" w={300} pr="20" />
      </HStack>
      <Text p="30px" fontSize={"xl"} mb="10" color="white">
        Our mission is to provide financial literacy to all. We believe that
        everyone should have access to financial advice and information, and we
        strive to make that a reality. We hope to lower the barrier of entry
        into the financial world and help people make better financial
        decisions.
      </Text>
      <LuPiggyBank id="slide-right" size={100} />
      <Center>
        <GrMoney size={100} />
      </Center>
    </div>
  );
}

export default About;
