import * as roomService from './services/roomService.js';
import * as gameService from './services/gameService.js';

async function runTests() {
  console.log('--- TEST 1: Room Creation & 6-Digit Code ---');
  const createRes = await roomService.createRoom('Player 1');
  console.assert(createRes.success === true, 'Room creation should succeed');
  console.assert(createRes.roomCode.length === 6, 'Room code should be 6 digits');
  console.log('✅ Room Code:', createRes.roomCode);

  console.log('--- TEST 2: Player 2 Joining Room ---');
  const joinRes = await roomService.joinRoom(createRes.roomCode, 'Player 2');
  console.assert(joinRes.success === true, 'Player 2 join should succeed');
  console.assert(joinRes.player.symbol === 'O', 'Player 2 should have symbol O');
  console.log('✅ Player 2 joined successfully');

  console.log('--- TEST 3: Ready System & Match Kickoff ---');
  await roomService.setPlayerReady(createRes.roomCode, createRes.player.id, true);
  await roomService.setPlayerReady(createRes.roomCode, joinRes.player.id, true);
  const matchRes = await gameService.startMatch(createRes.roomCode);
  console.assert(matchRes.success === true, 'Match start should succeed');
  console.assert(matchRes.room.match.currentRound === 1, 'Match should start at round 1');
  console.log('✅ Match started, current round:', matchRes.room.match.currentRound);

  console.log('--- TEST 4: Authoritative Move Processing & Win Detection ---');
  await gameService.makeMove(createRes.roomCode, createRes.player.id, 0);
  await gameService.makeMove(createRes.roomCode, joinRes.player.id, 3);
  await gameService.makeMove(createRes.roomCode, createRes.player.id, 1);
  await gameService.makeMove(createRes.roomCode, joinRes.player.id, 4);
  const winMove = await gameService.makeMove(createRes.roomCode, createRes.player.id, 2);

  console.assert(winMove.roundEnded === true, 'Round should end on 3-in-a-row');
  console.assert(winMove.room.match.scores.X === 1, 'X score should be 1');
  console.assert(winMove.room.match.scores.O === 0, 'O score should be 0');
  console.log('✅ Round 1 won by X. Scores:', winMove.room.match.scores);

  console.log('--- TEST 5: Next Round Transition ---');
  const nextRes = await gameService.nextRound(createRes.roomCode);
  console.assert(nextRes.success === true, 'Next round should succeed');
  console.assert(nextRes.room.match.currentRound === 2, 'Should advance to Round 2');
  console.log('✅ Advanced to Round:', nextRes.room.match.currentRound);

  console.log('--- TEST 6: Forfeit / Give Up ---');
  const giveUpRes = await gameService.giveUp(createRes.roomCode, joinRes.player.id);
  console.assert(giveUpRes.success === true, 'Give up should succeed');
  console.assert(giveUpRes.room.match.matchEnded === true, 'Match should end on give up');
  console.log('✅ Give up processed, winner:', giveUpRes.room.match.winner?.name);

  console.log('--- TEST 7: Rematch Sync ---');
  await gameService.requestRematch(createRes.roomCode, createRes.player.id);
  const rematchRes = await gameService.requestRematch(createRes.roomCode, joinRes.player.id);
  console.assert(rematchRes.success === true, 'Rematch trigger should succeed');
  console.assert(rematchRes.room.match.currentRound === 1, 'Rematch should reset to round 1');
  console.log('✅ Rematch triggered, reset match round:', rematchRes.room.match.currentRound);

  console.log('--- TEST 8: Draw Scenario Validation ---');
  const drawRoom = await roomService.createRoom('Draw P1');
  const drawP2 = await roomService.joinRoom(drawRoom.roomCode, 'Draw P2');
  await roomService.setPlayerReady(drawRoom.roomCode, drawRoom.player.id, true);
  await roomService.setPlayerReady(drawRoom.roomCode, drawP2.player.id, true);
  await gameService.startMatch(drawRoom.roomCode);

  await gameService.makeMove(drawRoom.roomCode, drawRoom.player.id, 0);
  await gameService.makeMove(drawRoom.roomCode, drawP2.player.id, 1);
  await gameService.makeMove(drawRoom.roomCode, drawRoom.player.id, 2);
  await gameService.makeMove(drawRoom.roomCode, drawP2.player.id, 4);
  await gameService.makeMove(drawRoom.roomCode, drawRoom.player.id, 3);
  await gameService.makeMove(drawRoom.roomCode, drawP2.player.id, 5);
  await gameService.makeMove(drawRoom.roomCode, drawRoom.player.id, 7);
  await gameService.makeMove(drawRoom.roomCode, drawP2.player.id, 6);
  const drawMove = await gameService.makeMove(drawRoom.roomCode, drawRoom.player.id, 8);

  console.assert(drawMove.roundEnded === true, 'Round should end on full board draw');
  console.assert(drawMove.isDraw === true, 'Round status should be draw');
  console.log('✅ Draw scenario verified successfully');

  console.log('--- TEST 9: Invalid Out-of-Turn Move Prevention ---');
  const moveTurnCheck = await gameService.makeMove(drawRoom.roomCode, drawP2.player.id, 0);
  console.assert(moveTurnCheck.success === false, 'Move out of turn or after round end should be rejected');
  console.log('✅ Invalid out-of-turn move properly rejected');

  console.log('--- TEST 10: Non-Existent Room Handling ---');
  const invalidJoin = await roomService.joinRoom('000000', 'Test');
  console.assert(invalidJoin.success === false, 'Joining non-existent room should fail gracefully');
  console.log('✅ Non-existent room handling verified');

  console.log('--- TEST 11: Out-of-Bounds Move Check ---');
  const testRoom = await roomService.createRoom('Bounds P1');
  const boundsP2 = await roomService.joinRoom(testRoom.roomCode, 'Bounds P2');
  await roomService.setPlayerReady(testRoom.roomCode, testRoom.player.id, true);
  await roomService.setPlayerReady(testRoom.roomCode, boundsP2.player.id, true);
  await gameService.startMatch(testRoom.roomCode);
  const oobMove = await gameService.makeMove(testRoom.roomCode, testRoom.player.id, 99);
  console.assert(oobMove.success === false, 'Out of bounds move cell index should be rejected');
  console.log('✅ Out-of-bounds move rejection verified');

  console.log('\n🎉 ALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
