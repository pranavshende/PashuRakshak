import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('mesh-alerts', {
      name: 'Bluetooth Mesh Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EF4444',
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

export const simulateBluetoothMeshBroadcast = async (diseaseName: string, delayMs: number = 3000) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.warn('Notification permission denied, skipping mesh simulation.');
    return false;
  }

  // Simulate a delay representing the time it takes for a BLE packet to hop through peers
  return new Promise((resolve) => {
    setTimeout(async () => {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 P2P Mesh Alert Received',
          body: `A case of ${diseaseName} has been reported nearby. (Received via Bluetooth Mesh Relay)`,
          data: { type: 'mesh_alert', disease: diseaseName },
          sound: true,
        },
        trigger: null, // trigger immediately
      });
      resolve(true);
    }, delayMs);
  });
};
