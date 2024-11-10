import { describe, test, expect } from '@jest/globals';
import { randomSk, WelcomeSimulator } from './welcome-test-setup.js';

describe('Welcome contract', () => {
  test('generates correct initial states', () => {
    const simulator = WelcomeSimulator.organizerDeploy('organizer', ['pid0', 'pid1']);
    const organizerPS = simulator.getPrivateState('organizer');
    expect(organizerPS.organizerSecretKey).not.toBe(null);
    expect(organizerPS.participantId).toBe(null);
    const initialLS = simulator.getLedgerState();
    expect(initialLS.eligibleParticipants.member('pid0')).toBe(true);
    expect(initialLS.eligibleParticipants.member('pid1')).toBe(true);
    expect(initialLS.eligibleParticipants.size()).toBe(2n);
    expect(initialLS.checkedInParticipants.isEmpty()).toBe(true);
    expect(initialLS.organizerPks.member(simulator.organizerPk('organizer'))).toBe(true);
    expect(initialLS.organizerPks.size()).toBe(1n);
    const participantPS = simulator.participantJoin('participant');
    expect(participantPS.participantId).toBe(null);
    expect(participantPS.organizerSecretKey).toBe(null);
  });

  test('participants added in the contract deployment can check in', () => {
    const simulator = WelcomeSimulator.organizerDeploy('organizer', ['pid0', 'pid1']);
    simulator.participantJoin('participant0');
    const checkinLS0 = simulator.as('participant0').checkIn('pid0');
    expect(checkinLS0.checkedInParticipants.member('pid0')).toBe(true);
    expect(checkinLS0.checkedInParticipants.size()).toBe(1n);
    simulator.participantJoin('participant1');
    const checkinLS1 = simulator.as('participant1').checkIn('pid1');
    expect(checkinLS1.checkedInParticipants.member('pid1')).toBe(true);
    expect(checkinLS1.checkedInParticipants.size()).toBe(2n);
  });

  test('an organizer can add participants', () => {
    const simulator = WelcomeSimulator.organizerDeploy('organizer');
    const addParticipantLS0 = simulator.as('organizer').addParticipant('pid0');
    expect(addParticipantLS0.eligibleParticipants.member('pid0')).toBe(true);
    expect(addParticipantLS0.checkedInParticipants.isEmpty()).toBe(true);
    const addParticipantLS1 = simulator.as('organizer').addParticipant('pid1');
    expect(addParticipantLS1.eligibleParticipants.member('pid0')).toBe(true);
    expect(addParticipantLS1.eligibleParticipants.member('pid1')).toBe(true);
    expect(addParticipantLS1.checkedInParticipants.isEmpty()).toBe(true);
    simulator.participantJoin('participant0');
    const checkinLS0 = simulator.as('participant0').checkIn('pid0');
    expect(checkinLS0.checkedInParticipants.member('pid0')).toBe(true);
    expect(checkinLS0.checkedInParticipants.size()).toBe(1n);
    const participant0PS = simulator.getPrivateState('participant0');
    expect(participant0PS.participantId).toEqual('pid0');
    expect(participant0PS.organizerSecretKey).toBe(null);
    simulator.participantJoin('participant1');
    const checkinLS1 = simulator.as('participant1').checkIn('pid1');
    expect(checkinLS1.checkedInParticipants.member('pid1')).toBe(true);
    expect(checkinLS1.checkedInParticipants.size()).toBe(2n);
    const participant1PS = simulator.getPrivateState('participant1');
    expect(participant1PS.participantId).toEqual('pid1');
    expect(participant1PS.organizerSecretKey).toBe(null);
  });

  test('an organizer can add organizers', () => {
    const simulator = WelcomeSimulator.organizerDeploy('organizer0');
    const organizer0Pk = simulator.organizerPk('organizer0');
    simulator.organizerJoin('organizer1');
    const organizer1Pk = simulator.organizerPk('organizer1');
    const addOrganizerLS = simulator.as('organizer0').addOrganizer(organizer1Pk);
    expect(addOrganizerLS.organizerPks.member(organizer0Pk)).toBe(true);
    expect(addOrganizerLS.organizerPks.member(organizer1Pk)).toBe(true);
    expect(addOrganizerLS.organizerPks.size()).toBe(2n);
  });

  test('non-organizers cannot add participants', () => {
    const simulator = WelcomeSimulator.organizerDeploy('organizer0');
    simulator.participantJoin('participant');
    simulator.updateUserPrivateState({ ...simulator.getPrivateState('participant'), organizerSecretKey: randomSk() });
    expect(() => simulator.as('participant').addParticipant('pid0')).toThrow('Not an organizer');
    simulator.organizerJoin('organizer1');
    expect(() => simulator.as('organizer1').addParticipant('pid0')).toThrow('Not an organizer');
  });

  test('non-organizers cannot add organizers', () => {
    const simulator = WelcomeSimulator.organizerDeploy('organizer0');
    simulator.organizerJoin('organizer1');
    expect(() => simulator.as('organizer1').addOrganizer(simulator.organizerPk('organizer1'))).toThrow('Not an organizer');
    simulator.participantJoin('participant');
    simulator.updateUserPrivateState({ ...simulator.getPrivateState('participant'), organizerSecretKey: randomSk() });
    expect(() => simulator.addOrganizer(simulator.organizerPk('organizer1')));
  });

  test('non-organizers cannot add participants', () => {
    const simulator = WelcomeSimulator.organizerDeploy('organizer0');
    simulator.organizerJoin('organizer1');
    expect(() => simulator.as('organizer1').addParticipant('pid0')).toThrow('Not an organizer');
    simulator.participantJoin('participant');
    simulator.updateUserPrivateState({ ...simulator.getPrivateState('participant'), organizerSecretKey: randomSk() });
    expect(() => simulator.addParticipant('pid0'));
  });

  test('non-participants cannot check in', () => {
    const simulator = WelcomeSimulator.organizerDeploy('organizer0');
    expect(() => simulator.checkIn('pid0')).toThrow('Not eligible participant');
  });
});
