// Diet plan template with time offsets in minutes from start time
const dietPlanTemplate = [
    { offset: 0, activity: 'Supplements (MV, Omega 3)', quantity: 'with 2 glass water' },
    { offset: 30, activity: 'Fat', quantity: '20 ml with bullet proof coffee' },
    { offset: 90, activity: 'Supplements (D vitamin, C vitamin)', quantity: 'with 2 glass water' },
    { offset: 150, activity: 'Green tea', quantity: '1 cup' },
    { offset: 210, activity: 'Water', quantity: '1 glass' },
    { offset: 270, activity: 'Water', quantity: '1 glass' },
    { offset: 330, activity: 'First meal', quantity: 'Balanced meal' },
    { offset: 390, activity: 'Water', quantity: '1 glass' },
    { offset: 450, activity: 'Water + Fat', quantity: '1 glass + 20 ml' },
    { offset: 510, activity: 'Water + Green tea', quantity: '1 glass + 1 cup' },
    { offset: 570, activity: 'Water', quantity: '1 glass' },
    { offset: 630, activity: 'Water + Fat', quantity: '1 glass + 20 ml' },
    { offset: 690, activity: 'Meal 2', quantity: 'Balanced meal' },
    { offset: 750, activity: 'Water', quantity: '1 glass' },
    { offset: 810, activity: 'Water', quantity: '1 glass' }
];

// DOM Elements
const startTimeInput = document.getElementById('startTime');
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const tableBody = document.getElementById('tableBody');
const tableNote = document.getElementById('tableNote');
const totalRemindersElem = document.getElementById('totalReminders');
const planDurationElem = document.getElementById('planDuration');
const waterIntakeElem = document.getElementById('waterIntake');

// Notification Elements
const enablePushNotif = document.getElementById('enablePushNotif');
const enableEmailNotif = document.getElementById('enableEmailNotif');
const enableSmsNotif = document.getElementById('enableSmsNotif');
const enableAudio = document.getElementById('enableAudio');
const emailAddress = document.getElementById('emailAddress');
const phoneNumber = document.getElementById('phoneNumber');
const startReminderBtn = document.getElementById('startReminderBtn');
const stopReminderBtn = document.getElementById('stopReminderBtn');
const nextReminderTime = document.getElementById('nextReminderTime');
const nextReminderActivity = document.getElementById('nextReminderActivity');
const notificationsLog = document.getElementById('notificationsLog');

// Theme Elements
const themeSelect = document.getElementById('themeSelect');

// State variables
let remindersActive = false;
let planStartTime = null;
let reminderCheckInterval = null;
let sentNotifications = new Set();
let calculatedReminders = [];

// Event Listeners
generateBtn.addEventListener('click', generatePlan);
resetBtn.addEventListener('click', resetPlan);
startTimeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generatePlan();
});

// Notification preference listeners
enableEmailNotif.addEventListener('change', () => {
    emailAddress.disabled = !enableEmailNotif.checked;
    if (enableEmailNotif.checked) emailAddress.focus();
});

enableSmsNotif.addEventListener('change', () => {
    phoneNumber.disabled = !enableSmsNotif.checked;
    if (enableSmsNotif.checked) phoneNumber.focus();
});

startReminderBtn.addEventListener('click', startReminders);
stopReminderBtn.addEventListener('click', stopReminders);

// Theme Listener
themeSelect.addEventListener('change', (e) => {
    setTheme(e.target.value);
});

// Function to convert time string (HH:MM) to minutes
function timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

// Function to convert minutes to time string (HH:MM)
function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// Function to format time for display (12-hour format with AM/PM)
function formatTimeDisplay(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${String(displayHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
}

// Function to generate the diet plan
function generatePlan() {
    const startTimeStr = startTimeInput.value;
    
    if (!startTimeStr) {
        alert('Please enter a start time');
        return;
    }

    const startTimeMinutes = timeToMinutes(startTimeStr);
    planStartTime = startTimeMinutes;
    
    // Clear existing table
    tableBody.innerHTML = '';
    calculatedReminders = [];
    sentNotifications.clear();
    
    // Generate table rows
    let waterCount = 0;
    let totalMinutes = 0;

    dietPlanTemplate.forEach((item, index) => {
        const reminderTimeMinutes = startTimeMinutes + item.offset;
        const reminderTimeStr = minutesToTime(reminderTimeMinutes);
        const displayTime = formatTimeDisplay(reminderTimeStr);

        // Store calculated reminder
        calculatedReminders.push({
            timeInMinutes: reminderTimeMinutes,
            timeStr: reminderTimeStr,
            displayTime: displayTime,
            activity: item.activity,
            quantity: item.quantity,
            offset: item.offset
        });

        // Count water intake
        if (item.activity.toLowerCase().includes('water')) {
            waterCount += 1;
        }

        // Update max duration
        if (item.offset > totalMinutes) {
            totalMinutes = item.offset;
        }

        // Create table row
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${displayTime}</td>
            <td>${item.activity}</td>
            <td>${item.quantity}</td>
        `;
        row.id = `reminder-${index}`;
        
        // Add alternating row styling
        if (index % 2 === 0) {
            row.style.backgroundColor = '#fafafa';
        }

        tableBody.appendChild(row);
    });

    // Update statistics
    updateStatistics(waterCount, totalMinutes);
    
    // Enable reminder button
    startReminderBtn.disabled = false;
    
    // Hide the note and show the table
    tableNote.classList.add('hidden');
}

// Function to update statistics
function updateStatistics(waterCount, totalMinutes) {
    totalRemindersElem.textContent = dietPlanTemplate.length;
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const durationText = minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    planDurationElem.textContent = durationText;
    
    waterIntakeElem.textContent = `${waterCount} glasses`;
}

// Function to reset the plan
function resetPlan() {
    stopReminders();
    startTimeInput.value = '08:00';
    tableBody.innerHTML = '';
    tableNote.classList.remove('hidden');
    totalRemindersElem.textContent = '0';
    planDurationElem.textContent = '0 hours';
    waterIntakeElem.textContent = '0 glasses';
    startReminderBtn.disabled = true;
    planStartTime = null;
    calculatedReminders = [];
    sentNotifications.clear();
    nextReminderTime.textContent = 'No reminders scheduled';
    nextReminderActivity.textContent = '-';
}

// Function to start reminders
function startReminders() {
    if (!planStartTime || calculatedReminders.length === 0) {
        alert('Please generate a plan first');
        return;
    }

    // Validate email if enabled
    if (enableEmailNotif.checked && !emailAddress.value) {
        alert('Please enter an email address');
        emailAddress.focus();
        return;
    }

    // Validate phone if enabled
    if (enableSmsNotif.checked && !phoneNumber.value) {
        alert('Please enter a phone number');
        phoneNumber.focus();
        return;
    }

    remindersActive = true;
    startReminderBtn.disabled = true;
    stopReminderBtn.disabled = false;
    startTimeInput.disabled = true;
    generateBtn.disabled = true;
    resetBtn.disabled = true;

    // Request notification permission if push is enabled
    if (enablePushNotif.checked && 'Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted');
                    registerServiceWorkerForNotifications();
                } else if (permission === 'denied') {
                    alert('Notifications are blocked. Please enable notifications in your Android settings.');
                }
            }).catch(err => {
                console.error('Error requesting notification permission:', err);
            });
        } else if (Notification.permission === 'granted') {
            registerServiceWorkerForNotifications();
        } else if (Notification.permission === 'denied') {
            alert('Notifications are blocked. Please enable notifications in your Android settings.');
        }
    }

    // Register Service Worker for background notifications
    if (enablePushNotif.checked && 'serviceWorker' in navigator) {
        registerServiceWorkerForNotifications();
    }

    // Start checking reminders every 10 seconds
    reminderCheckInterval = setInterval(checkReminders, 10000);
    
    // Also check immediately
    checkReminders();
}

// Function to stop reminders
function stopReminders() {
    remindersActive = false;
    startReminderBtn.disabled = false;
    stopReminderBtn.disabled = true;
    startTimeInput.disabled = false;
    generateBtn.disabled = false;
    resetBtn.disabled = false;

    if (reminderCheckInterval) {
        clearInterval(reminderCheckInterval);
        reminderCheckInterval = null;
    }

    nextReminderTime.textContent = 'Reminders Stopped';
    nextReminderActivity.textContent = 'Click "Start Reminders" to resume';
}

// Function to check and send reminders
function checkReminders() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Find reminders that should be sent
    calculatedReminders.forEach((reminder, index) => {
        const reminderKey = `${reminder.offset}-${reminder.activity}`;
        
        // Check if reminder time is within 5 minutes range and not sent yet
        if (!sentNotifications.has(reminderKey)) {
            const timeDiff = Math.abs(reminder.timeInMinutes - currentMinutes);
            
            // Trigger if within 5 minutes range (accounting for daily cycle)
            if (timeDiff <= 5 || timeDiff >= (24 * 60 - 5)) {
                sendReminder(reminder, index);
                sentNotifications.add(reminderKey);
            }
        }
    });

    // Update next reminder display
    updateNextReminder(currentMinutes);
}

// Function to register Service Worker for notifications
function registerServiceWorkerForNotifications() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
            console.log('Service Worker registered for notifications:', registration);
            
            // Subscribe to push notifications if supported
            if ('pushManager' in registration) {
                registration.pushManager.getSubscription().then((subscription) => {
                    if (!subscription) {
                        console.log('No push subscription found');
                    } else {
                        console.log('Already subscribed to push notifications');
                    }
                }).catch(err => {
                    console.log('Error checking push subscription:', err);
                });
            }
        }).catch(err => {
            console.error('Service Worker registration error:', err);
        });
    }
}

// Function to send push notification via Service Worker
function sendPushViaServiceWorker(reminder) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
            const notificationData = {
                title: 'VRK Diet Reminder',
                body: `${reminder.activity}\n${reminder.quantity}`,
                icon: '🥗',
                badge: '🥗',
                tag: `reminder-${reminder.offset}`,
                requireInteraction: true,
                vibrate: [200, 100, 200],
                timestamp: Date.now(),
                silent: false
            };

            // Try to send via push manager if available
            if (registration.pushManager) {
                registration.pushManager.getSubscription().then((subscription) => {
                    if (subscription) {
                        // Has a subscription, use it
                        console.log('Sending via push subscription');
                    }
                });
            }
        }).catch(err => {
            console.log('Service Worker not ready:', err);
        });
    }
}

// Function to attach handlers to notification object
function attachNotificationHandlers(notification) {
    notification.onclick = () => {
        notification.close();
        window.focus();
    };

    notification.onclose = () => {
        console.log('Notification closed');
    };

    notification.onerror = () => {
        console.error('Notification error');
    };
}

// Function to send reminder notification
function sendReminder(reminder, index) {
    const message = `⏰ Time for: ${reminder.activity} (${reminder.quantity})`;
    const timestamp = new Date().toLocaleTimeString();

    // Push notification with system tray integration
    if (enablePushNotif.checked && 'Notification' in window && Notification.permission === 'granted') {
        const notificationOptions = {
            body: `${reminder.activity}\n${reminder.quantity}`,
            icon: './icons/icon-192.png', // Use actual icon from manifest
            badge: './icons/icon-192.png',
            tag: `reminder-${reminder.offset}`, // Prevents duplicate notifications
            requireInteraction: true, // Keeps notification visible until user interacts
            vibrate: [200, 100, 200], // Vibration pattern for Android
            timestamp: Date.now(),
            silent: false, // Enable sound
            dir: 'auto'
        };

        try {
            // For Android PWA, use Service Worker if available
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then((registration) => {
                    registration.showNotification('VRK Diet Reminder', notificationOptions);
                }).catch(err => {
                    // Fallback to standard Notification API
                    const notification = new Notification('VRK Diet Reminder', notificationOptions);
                    attachNotificationHandlers(notification);
                });
            } else {
                // Standard Notification API fallback
                const notification = new Notification('VRK Diet Reminder', notificationOptions);
                attachNotificationHandlers(notification);
            }
        } catch (error) {
            console.error('Notification error:', error);
        }
    }

    // Email notification (simulated)
    if (enableEmailNotif.checked) {
        logNotification('email', `Email sent to ${emailAddress.value}`, message, timestamp);
    }

    // SMS notification (simulated)
    if (enableSmsNotif.checked) {
        logNotification('sms', `SMS sent to ${phoneNumber.value}`, message, timestamp);
    }

    // Audio alert
    if (enableAudio.checked) {
        playAudioAlert();
    }

    // Visual highlight on table row
    const row = document.getElementById(`reminder-${index}`);
    if (row) {
        row.style.backgroundColor = '#fff3cd';
        row.style.animation = 'pulse 1s infinite';
    }

    // Add to log if any notification type is enabled
    if (enablePushNotif.checked || enableEmailNotif.checked || enableSmsNotif.checked) {
        logNotification('push', `Reminder at ${reminder.displayTime}`, reminder.activity, timestamp);
    }
}

// Function to log notification
function logNotification(type, header, message, timestamp) {
    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.innerHTML = `
        <span class="log-item-time">${timestamp}</span>
        <div class="log-item-message">${header}: ${message}</div>
    `;

    const emptyLog = notificationsLog.querySelector('.empty-log');
    if (emptyLog) {
        emptyLog.remove();
    }

    notificationsLog.insertBefore(logItem, notificationsLog.firstChild);

    // Keep only last 10 notifications
    while (notificationsLog.children.length > 10) {
        notificationsLog.removeChild(notificationsLog.lastChild);
    }
}

// Function to play audio alert
function playAudioAlert() {
    // Create audio context and play beep
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// Function to update next reminder display
function updateNextReminder(currentMinutes) {
    const nextReminder = calculatedReminders.find(r => {
        const timeDiff = r.timeInMinutes - currentMinutes;
        return timeDiff > 5 && timeDiff < 1440; // Within next 24 hours
    });

    if (nextReminder) {
        nextReminderTime.textContent = nextReminder.displayTime;
        nextReminderActivity.textContent = nextReminder.activity;
    } else {
        nextReminderTime.textContent = 'Plan Complete';
        nextReminderActivity.textContent = 'All reminders for today completed';
    }
}

// Theme Management Functions
function setTheme(themeName) {
    const html = document.documentElement;
    
    // Remove all theme classes
    html.classList.remove('dark-theme', 'nature-theme', 'ocean-theme', 'sunset-theme');
    
    // Add new theme class if not light
    if (themeName !== 'light') {
        html.classList.add(`${themeName}-theme`);
    }
    
    // Save theme preference
    localStorage.setItem('preferred-theme', themeName);
    
    // Update select value
    themeSelect.value = themeName;
}

function getPreferredTheme() {
    // Check localStorage first
    const saved = localStorage.getItem('preferred-theme');
    if (saved) return saved;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    
    // Default to light
    return 'light';
}

function initTheme() {
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
            if (!localStorage.getItem('preferred-theme')) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Set default start time
    startTimeInput.value = '08:00';
    startReminderBtn.disabled = true;
    stopReminderBtn.disabled = true;
});




