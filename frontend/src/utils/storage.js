const KEYS = {
  PLAYER_NAME: 'ttt_player_name',
  DIFFICULTY: 'ttt_difficulty',
  LAST_ROOM_CODE: 'ttt_last_room',
  PLAYER_ID: 'ttt_player_id',
};

export const getStoredPlayerName = () => {
  try {
    return localStorage.getItem(KEYS.PLAYER_NAME) || '';
  } catch (e) {
    return '';
  }
};

export const setStoredPlayerName = (name) => {
  try {
    if (name) localStorage.setItem(KEYS.PLAYER_NAME, name.trim());
  } catch (e) {
    // Ignore storage errors
  }
};

export const getStoredDifficulty = () => {
  try {
    return localStorage.getItem(KEYS.DIFFICULTY) || 'medium';
  } catch (e) {
    return 'medium';
  }
};

export const setStoredDifficulty = (diff) => {
  try {
    if (diff) localStorage.setItem(KEYS.DIFFICULTY, diff);
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
