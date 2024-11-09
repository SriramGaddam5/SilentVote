import { Heading, Text, HStack, Image, Spacer, Center } from "@chakra-ui/react";
import { LuPiggyBank } from "react-icons/lu";
import { GrMoney } from "react-icons/gr";

import "../styles/About.css";

function About() {
  return (
    <div id="Body">
      <Heading p="30px">About Us</Heading>
      <HStack my="10" p="30px">
        <Image src="/images/Dollar.svg" w={300} />
        <Text p="30px" fontSize={"xl"}>
          Finnow is a platform intended to assist users with their financial
          journey. It utilizes an LLM that gives users advice based on their
          inputted financial data, making recommendations on savings,
          investments, income, and expenditures. The goal of our platform is to
          support financial literacy and lower the barrier of entry into the
          financial world.
        </Text>
      </HStack>
      <HStack>
        <Heading p="30px">Our Mission</Heading>
        <Spacer />
        <Image src="/images/Minnow.svg" w={300} pr="20" />
      </HStack>
      <Text p="30px" fontSize={"xl"} mb="10">
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
