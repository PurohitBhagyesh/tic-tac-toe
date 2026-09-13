const KEYS = {
  PLAYER_NAME: 'ttt_player_name',
  DIFFICULTY: 'ttt_difficulty',
  LAST_ROOM_CODE: 'ttt_last_room',
  PLAYER_ID: 'ttt_player_id',
  SINGLE_PLAYER_TIMER: 'ttt_sp_timer',
};

export const getStoredPlayerName = () => {
  try {
    const val = localStorage.getItem(KEYS.PLAYER_NAME);
    return val ? val.trim() : '';
  } catch (e) {
    return '';
  }
};

export const setStoredPlayerName = (name) => {
  try {
    if (typeof name === 'string') {
      const trimmed = name.trim();
      if (trimmed) {
        localStorage.setItem(KEYS.PLAYER_NAME, trimmed);
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
};

export const getStoredDifficulty = () => {
  try {
    const val = localStorage.getItem(KEYS.DIFFICULTY);
    if (val && ['easy', 'medium', 'hard'].includes(val.toLowerCase())) {
      return val.toLowerCase();
    }
    return 'medium';
  } catch (e) {
    return 'medium';
  }
};

export const setStoredDifficulty = (diff) => {
  try {
    if (diff && ['easy', 'medium', 'hard'].includes(diff.toLowerCase())) {
      localStorage.setItem(KEYS.DIFFICULTY, diff.toLowerCase());
    }
  } catch (e) {}
};

export const getStoredPlayerId = () => {
  try {
    return localStorage.getItem(KEYS.PLAYER_ID) || null;
  } catch (e) {
    return null;
  }
};

export const setStoredPlayerId = (id) => {
  try {
    if (id) localStorage.setItem(KEYS.PLAYER_ID, id);
  } catch (e) {}
};

export const getStoredSinglePlayerTimer = () => {
  try {
    const val = localStorage.getItem(KEYS.SINGLE_PLAYER_TIMER);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && [0, 30, 60, 120].includes(parsed)) {
      return parsed;
    }
    return 60; // default 1 minute
  } catch (e) {
    return 60;
  }
};

export const setStoredSinglePlayerTimer = (seconds) => {
  try {
    if (typeof seconds === 'number') {
      localStorage.setItem(KEYS.SINGLE_PLAYER_TIMER, String(seconds));
    }
  } catch (e) {}
};
