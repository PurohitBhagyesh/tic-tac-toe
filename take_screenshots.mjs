import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('./screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  console.log('Starting full suite screenshot capture...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: {
      width: 1280,
      height: 840,
      deviceScaleFactor: 2,
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,840']
  });

  try {
    const page = await browser.newPage();

    // 1. HOME SCREEN
    console.log('1. Capturing home_screen.png...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await wait(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'home_screen.png') });

    // 2. GAME RULES MODAL
    console.log('2. Capturing game_rules_modal.png...');
    await page.evaluate(() => {
      const btn = document.querySelector('button[title="Game Options & Settings"], button[aria-label="Game options and settings menu"]');
      if (btn) btn.click();
    });
    await wait(400);
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const rulesBtn = buttons.find(b => b.textContent.includes('Game Rules'));
      if (rulesBtn) rulesBtn.click();
    });
    await wait(600);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'game_rules_modal.png') });
    await page.keyboard.press('Escape');
    await wait(400);

    // 3. MULTIPLAYER MENU
    console.log('3. Capturing multiplayer_menu.png...');
    await page.goto(`${BASE_URL}/multiplayer`, { waitUntil: 'networkidle0' });
    await wait(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'multiplayer_menu.png') });

    // 4. JOIN ROOM
    console.log('4. Capturing join_room.png...');
    await page.goto(`${BASE_URL}/join`, { waitUntil: 'networkidle0' });
    await wait(500);
    const inputField = await page.$('input[type="text"]');
    if (inputField) {
      await inputField.type('582914', { delay: 50 });
    }
    await wait(500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'join_room.png') });

    // 5. SINGLEPLAYER CONFIG
    console.log('5. Capturing singleplayer_config.png...');
    await page.goto(`${BASE_URL}/singleplayer`, { waitUntil: 'networkidle0' });
    await wait(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'singleplayer_config.png') });

    // 6. SINGLEPLAYER GAME (In-progress moves)
    console.log('6. Capturing singleplayer_game.png with active moves...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent.toUpperCase().includes('START') || b.textContent.toUpperCase().includes('PLAY'));
      if (startBtn) startBtn.click();
    });
    await wait(600);

    // Click center cell (4)
    await page.evaluate(() => {
      const cells = document.querySelectorAll('.game-cell');
      if (cells[4]) cells[4].click();
    });
    await wait(1000);

    // Click top-left cell (0)
    await page.evaluate(() => {
      const cells = document.querySelectorAll('.game-cell');
      if (cells[0] && !cells[0].classList.contains('occupied')) {
        cells[0].click();
      } else if (cells[2] && !cells[2].classList.contains('occupied')) {
        cells[2].click();
      }
    });
    await wait(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'singleplayer_game.png') });

    // 7. VICTORY OUTCOME MODAL
    console.log('7. Capturing victory_outcome_modal.png...');
    await page.goto(`${BASE_URL}/singleplayer`, { waitUntil: 'networkidle0' });
    await wait(500);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const easyBtn = btns.find(b => b.textContent.toLowerCase().includes('easy'));
      if (easyBtn) easyBtn.click();
    });
    await wait(300);

    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const startBtn = btns.find(b => b.textContent.toUpperCase().includes('START') || b.textContent.toUpperCase().includes('PLAY'));
      if (startBtn) startBtn.click();
    });
    await wait(600);

    await page.evaluate(() => {
      const cells = document.querySelectorAll('.game-cell');
      if (cells[0]) cells[0].click();
    });
    await wait(700);

    await page.evaluate(() => {
      const cells = document.querySelectorAll('.game-cell');
      if (cells[1] && !cells[1].classList.contains('occupied')) cells[1].click();
    });
    await wait(700);

    await page.evaluate(() => {
      const cells = document.querySelectorAll('.game-cell');
      if (cells[2] && !cells[2].classList.contains('occupied')) cells[2].click();
    });
    await wait(1200);

    await page.screenshot({ path: path.join(OUTPUT_DIR, 'victory_outcome_modal.png') });
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'finish_outcome_modal.png') });

    // 8. CREATE ROOM & QR CODE
    console.log('8. Capturing create_room.png with QR code...');
    await page.goto(`${BASE_URL}/create-room`, { waitUntil: 'networkidle0' });
    await wait(500);
    await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"], form button');
      if (btn) btn.click();
    });
    await wait(2200);
    await page.screenshot({ path: path.join(OUTPUT_DIR, 'create_room.png') });

    // 9. MULTIPLAYER LOBBY (Two clients via socket)
    console.log('9. Capturing multiplayer_lobby.png and multiplayer_game.png...');
    const roomCode = await page.evaluate(() => {
      const match = document.body.innerText.match(/\b\d{6}\b/);
      return match ? match[0] : null;
    });

    if (roomCode) {
      console.log(`Room Code for multiplayer: ${roomCode}`);
      const guestPage = await browser.newPage();
      await guestPage.goto(`${BASE_URL}/join/${roomCode}`, { waitUntil: 'networkidle0' });
      await wait(600);

      await guestPage.evaluate(() => {
        const btn = document.querySelector('button[type="submit"], form button');
        if (btn) btn.click();
      });

      // Wait for both players to enter lobby
      await wait(3000);

      // Guest marks ready
      await guestPage.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const readyBtn = btns.find(b => b.textContent.toUpperCase().includes('READY') || b.textContent.toUpperCase().includes('I\'M READY'));
        if (readyBtn) readyBtn.click();
      });
      await wait(1000);

      // Host marks ready
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const readyBtn = btns.find(b => b.textContent.toUpperCase().includes('READY') || b.textContent.toUpperCase().includes('I\'M READY'));
        if (readyBtn) readyBtn.click();
      });
      await wait(1200);

      await page.screenshot({ path: path.join(OUTPUT_DIR, 'multiplayer_lobby.png') });
      console.log('multiplayer_lobby.png saved.');

      // Host clicks Start Match
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const startBtn = btns.find(b => b.textContent.toUpperCase().includes('START'));
        if (startBtn) startBtn.click();
      });
      await wait(2500);

      // Host plays center cell (4)
      await page.evaluate(() => {
        const cells = document.querySelectorAll('.game-cell');
        if (cells[4]) cells[4].click();
      });
      await wait(1200);

      // Guest plays top-left cell (0)
      await guestPage.evaluate(() => {
        const cells = document.querySelectorAll('.game-cell');
        if (cells[0]) cells[0].click();
      });
      await wait(1200);

      // Host plays bottom-right cell (8)
      await page.evaluate(() => {
        const cells = document.querySelectorAll('.game-cell');
        if (cells[8]) cells[8].click();
      });
      await wait(1200);

      await page.screenshot({ path: path.join(OUTPUT_DIR, 'multiplayer_game.png') });
      console.log('multiplayer_game.png saved.');

      await guestPage.close();
    }

    console.log('All screenshots captured and saved successfully!');
  } catch (err) {
    console.error('Error during run:', err);
  } finally {
    await browser.close();
  }
}

run();
