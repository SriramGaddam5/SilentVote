# Welcome DApp and contract for the Midnight tutorial

The code in this `welcome` directory is used in part 1 of the Midnight
developer tutorial.  Its main function is to maintain on the ledger a
set of **testnet** participants who have checked in by calling the
`check_in` circuit.  Whenever someone attempts to check in, that
user's identity is validated by verifying that the user is already
included in the set of eligible participants.  The set of eligible
participants is maintained by one of the *organizers*.  An organizer is
anyone in the set of organizers, also maintained on the ledger.  Any
organizer can add new identities to the set of organizers.

## Subdirectories

The contract itself can be found in the `src` subdirectory of the
`contract` directory.  Some supporting TypeScript code can be found
there, too.

There are separate user interfaces for organizers and participants,
with supporting code found in appropriately named directories:
`organizer-ui` and `organizer-cli` for the organizers and
`participant-ui` for participants.  Common helpers are factored out in
the `helpers` directory, and an API model to help synchronize the
user interface with the internal actions is in the `api` directory.
