import * as roomService from '../services/roomService.js';
import * as gameService from '../services/gameService.js';

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] New client connected: ${socket.id}`);

    let currentRoomCode = null;
    let currentPlayerId = null;

    /**
     * Join socket room channel
     */
    socket.on('room:join', async ({ roomCode, playerId }) => {
      try {
        if (!roomCode || !playerId) {
          socket.emit('game:error', { message: 'Missing roomCode or playerId' });
          return;
        }

        const room = await roomService.getRoom(roomCode);
        if (!room) {
          socket.emit('game:error', { message: 'Room not found' });
          return;
        }

        currentRoomCode = roomCode;
        currentPlayerId = playerId;

        // Associate socket with room
        socket.join(`room_${roomCode}`);
        await roomService.updatePlayerSocket(roomCode, playerId, socket.id, true);

        const updatedRoom = await roomService.getRoom(roomCode);
        const sanitized = roomService.sanitizeRoom(updatedRoom);

        console.log(`👤 Player ${playerId} joined room channel: room_${roomCode}`);

        // Notify entire room
        io.to(`room_${roomCode}`).emit('room:playerJoined', {
          room: sanitized,
          playerId,
          message: 'Player joined room'
        });
      } catch (error) {
        console.error('[Socket room:join Error]:', error.message);
        socket.emit('game:error', { message: 'Failed to join room channel' });
      }
    });

    /**
     * Ready check (Both players must get ready)
     */
    socket.on('room:ready', async ({ roomCode, playerId, ready }) => {
      try {
        const result = await roomService.setPlayerReady(roomCode, playerId, ready);
        if (!result.success) {
          socket.emit('game:error', { message: result.error });
          return;
        }

        io.to(`room_${roomCode}`).emit('room:readyUpdate', {
          room: result.room,
          playerId,
          ready,
          allReady: result.allReady,
        });
      } catch (error) {
        console.error('[Socket room:ready Error]:', error.message);
        socket.emit('game:error', { message: 'Failed to update ready state' });
      }
    });

    /**
     * Host Start Game (Triggered by Host when both players are ready)
     */
    socket.on('game:hostStart', async ({ roomCode, playerId }) => {
      try {
        const room = await roomService.getRoom(roomCode);
        if (!room) {
          socket.emit('game:error', { message: 'Room not found' });
          return;
        }

        const isHost = room.players.length > 0 && room.players[0].id === playerId;
        if (!isHost) {
          socket.emit('game:error', { message: 'Only the host can start the game.' });
          return;
        }

        const allReady = room.players.length === 2 && room.players.every(p => p.ready);
        if (!allReady) {
          socket.emit('game:error', { message: 'Both players must be ready before starting.' });
          return;
        }

        const matchResult = await gameService.startMatch(roomCode);
        if (matchResult.success) {
          console.log(`🎮 Game started by host for room: ${roomCode}`);
          io.to(`room_${roomCode}`).emit('game:start', {
            room: matchResult.room,
            message: 'Game started! Round 1 of 5'
          });
        }
      } catch (error) {
        console.error('[Socket game:hostStart Error]:', error.message);
        socket.emit('game:error', { message: 'Failed to start game' });
      }
    });

    /**
     * Move request (Authoritative Server Validation)
     */
    socket.on('game:move', async ({ roomCode, playerId, cellIndex }) => {
      try {
        const result = await gameService.makeMove(roomCode, playerId, cellIndex);
        if (!result.success) {
          socket.emit('game:error', { message: result.error });
          return;
        }

        // Broadcast move update
        io.to(`room_${roomCode}`).emit('game:update', {
          room: result.room,
          lastMove: { playerId, cellIndex }
        });

        // Broadcast round end
        if (result.roundEnded && !result.matchEnded) {
          io.to(`room_${roomCode}`).emit('game:roundEnd', {
            room: result.room,
            roundWinner: result.room.match.roundWinner,
            winningLine: result.room.match.winningLine,
            currentRound: result.room.match.currentRound,
            scores: result.room.match.scores,
            message: result.room.match.roundWinner === 'draw'
              ? 'Round Draw!'
              : `Round ${result.room.match.currentRound} won by ${result.room.match.roundWinner}!`
          });
        }

        // Broadcast match end after 5 rounds
        if (result.matchEnded) {
          io.to(`room_${roomCode}`).emit('game:matchEnd', {
            room: result.room,
            matchWinner: result.room.match.matchWinner,
            scores: result.room.match.scores,
            message: result.room.match.matchWinner === 'draw'
              ? 'Match ended in a Draw!'
              : `Match Winner: Player ${result.room.match.matchWinner}!`
          });
        }
      } catch (error) {
        console.error('[Socket game:move Error]:', error.message);
        socket.emit('game:error', { message: 'Failed to process move' });
      }
    });

    /**
     * Next round transition
     */
    socket.on('game:nextRound', async ({ roomCode }) => {
      try {
        const result = await gameService.nextRound(roomCode);
        if (!result.success) {
          socket.emit('game:error', { message: result.error });
          return;
        }

        io.to(`room_${roomCode}`).emit('game:update', {
          room: result.room,
          message: `Starting Round ${result.room.match.currentRound} of 5!`
        });
      } catch (error) {
        console.error('[Socket game:nextRound Error]:', error.message);
        socket.emit('game:error', { message: 'Failed to start next round' });
      }
    });

    /**
     * Give Up / Forfeit
     */
    socket.on('game:giveUp', async ({ roomCode, playerId }) => {
      try {
        const result = await gameService.giveUpMatch(roomCode, playerId);
        if (!result.success) {
          socket.emit('game:error', { message: result.error });
          return;
        }

        io.to(`room_${roomCode}`).emit('game:matchEnd', {
          room: result.room,
          forfeited: true,
          forfeitingPlayer: result.forfeitingPlayer,
          matchWinner: result.room.match.matchWinner,
          scores: result.room.match.scores,
          message: `${result.forfeitingPlayer?.name || 'Player'} gave up. Match ended.`
        });
      } catch (error) {
        console.error('[Socket game:giveUp Error]:', error.message);
        socket.emit('game:error', { message: 'Failed to forfeit match' });
      }
    });

    /**
     * Rematch Request
     */
    socket.on('game:rematch', async ({ roomCode, playerId }) => {
      try {
        const result = await gameService.requestRematch(roomCode, playerId);
        if (!result.success) {
          socket.emit('game:error', { message: result.error });
          return;
        }

        if (result.room.status === 'playing') {
          // Both accepted, match restarted
          io.to(`room_${roomCode}`).emit('game:start', {
            room: result.room,
            message: 'Rematch accepted! Starting new 5-round match.'
          });
        } else {
          // Waiting for second vote
          io.to(`room_${roomCode}`).emit('game:rematchUpdate', {
            room: result.room,
            votedPlayer: result.votedPlayer,
            message: `${result.votedPlayer?.name || 'Opponent'} wants a rematch!`
          });
        }
      } catch (error) {
        console.error('[Socket game:rematch Error]:', error.message);
        socket.emit('game:error', { message: 'Failed to process rematch request' });
      }
    });

    /**
     * Leave Room Explicitly
     */
    socket.on('room:leave', async ({ roomCode, playerId }) => {
      try {
        const targetRoomCode = roomCode || currentRoomCode;
        const targetPlayerId = playerId || currentPlayerId;

        if (targetRoomCode && targetPlayerId) {
          socket.leave(`room_${targetRoomCode}`);
          const result = await roomService.leaveRoom(targetRoomCode, targetPlayerId);

          if (result.success && !result.roomEmpty) {
            io.to(`room_${targetRoomCode}`).emit('room:playerLeft', {
              room: result.room,
              leavingPlayer: result.leavingPlayer,
              message: `${result.leavingPlayer?.name || 'Opponent'} left the room.`
            });
          }
        }
      } catch (error) {
        console.error('[Socket room:leave Error]:', error.message);
      }
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', async (reason) => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
      if (currentRoomCode && currentPlayerId) {
        try {
          await roomService.updatePlayerSocket(currentRoomCode, currentPlayerId, socket.id, false);
          const room = await roomService.getRoom(currentRoomCode);
          if (room) {
            io.to(`room_${currentRoomCode}`).emit('room:playerDisconnected', {
              playerId: currentPlayerId,
              message: 'Opponent temporarily disconnected.'
            });
          }
        } catch (err) {
          console.error('[Socket disconnect Error]:', err.message);
        }
      }
    });
  });
};
