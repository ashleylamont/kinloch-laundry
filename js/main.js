import '../css/styles.css';
import * as workerTimers from 'worker-timers';

let timerHandle = null;
let notifications = false;

function update() {
  const timerType = localStorage.getItem('timerType') ?? '';
  const timerStart = Number(localStorage.getItem('timerStart') ?? '0');
  const lastNotif = Number(localStorage.getItem('lastNotif') ?? '0');

  const timerDurations = {
    dryer: 3600000,
    washer: 1380000,
    '': 0,
  };

  const currentTime = Date.now();
  const elapsedTime = currentTime - timerStart;
  if (elapsedTime >= timerDurations[timerType]) {
    document.getElementById('timer').style.display = 'none';
    document.getElementById('noTimer').style.display = 'block';
  } else {
    document.getElementById('noTimer').style.display = 'none';
    document.getElementById('timer').style.display = 'block';

    let timerText = '';
    const remaining = new Date(timerDurations[timerType] - elapsedTime);
    timerText += remaining.getMinutes().toString(10).padStart(2, '0');
    timerText += ':';
    timerText += remaining.getSeconds().toString(10).padStart(2, '0');
    document.getElementById('timerRemaining').innerText = timerText;

    if (!timerHandle) {
      timerHandle = workerTimers.setInterval(update, 1000);
    }

    if (remaining.getMinutes() === 0
      && remaining.getSeconds() === 0
      && remaining.getTime() >= -1000
      && Date.now() - lastNotif >= 60000) {
      if (timerHandle) {
        workerTimers.clearTimeout(timerHandle);
        timerHandle = null;
      }
      if (notifications) {
        console.log('Notification');
        const notification = new Notification(`${timerType === 'dryer' ? 'Dryer' : 'Washing Machine'} is ready to be collected.`, {
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200, 100, 200, 100, 200],
          silent: false,
        });
        localStorage.setItem('lastNotif', Date.now().toString(10));
        notification.addEventListener('click', () => {
          notification.close();
        });
      }
    }
  }
}

document.getElementById('washerBtn').addEventListener('click', () => {
  console.log('Washer');
  localStorage.setItem('timerType', 'washer');
  localStorage.setItem('timerStart', Date.now().toString());
  update();
});

document.getElementById('dryerBtn').addEventListener('click', () => {
  console.log('Dryer');
  localStorage.setItem('timerType', 'dryer');
  localStorage.setItem('timerStart', Date.now().toString());
  update();
});

update();

window.setInterval(update, 1000);

if (!('Notification' in window)) {
  // eslint-disable-next-line no-alert
  alert('This browser does not support notifications. This app will not work.');
} else if (Notification.permission === 'granted') {
  // If it's okay let's create a notification
  notifications = true;
} else if (Notification.permission !== 'denied') {
  Notification.requestPermission().then((permission) => {
    // If the user accepts, let's create a notification
    if (permission === 'granted') {
      notifications = true;
      const notification = new Notification('Alerts will appear like this.');
      notification.addEventListener('click', () => {
        notification.close();
      });
    }
  });
} else {
  // eslint-disable-next-line no-alert
  alert('You have disabled notifications for this app. You will need to enable them for this app to work.');
}
