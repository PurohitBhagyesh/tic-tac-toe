import * as roomService from '../services/roomService.js';
import * as gameService from '../services/gameService.js';

export const createRoom = async (req, res, next) => {
  try {
    const { playerName } = req.body;
    const result = await roomService.createRoom(playerName);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getRoom = async (req, res, next) => {
  try {
    const { code } = req.params;
    const room = await roomService.getRoom(code);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found. Please verify the 6-digit code.'
      });
    }
    return res.status(200).json({
      success: true,
      room: roomService.sanitizeRoom(room)
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoom = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { playerName, playerId } = req.body;
    const result = await roomService.joinRoom(code, playerName, playerId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateReady = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { playerId, ready } = req.body;
    const result = await roomService.setPlayerReady(code, playerId, ready);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const requestRematch = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { playerId } = req.body;
    const result = await gameService.requestRematch(code, playerId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const leaveRoom = async (req, res, next) => {
  try {
    const { code } = req.params;
    const { playerId } = req.body;
    const result = await roomService.leaveRoom(code, playerId);
    if (!result.success) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
