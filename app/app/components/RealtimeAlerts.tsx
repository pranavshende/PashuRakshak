import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import * as Notifications from 'expo-notifications';

export default function RealtimeAlerts() {
  useEffect(() => {
    // Request notification permissions for Mobile
    if (Platform.OS !== 'web') {
      Notifications.requestPermissionsAsync();
      
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }

    const channel = supabase
      .channel('public:Prediction')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'Prediction', filter: 'riskLevel=eq.HIGH' }, 
        (payload) => {
          const disease = payload.new.disease;
          const msg = `🚨 HIGH RISK DETECTED: A new case of ${disease} has been reported nearby!`;
          
          if (Platform.OS === 'web') {
            // For web, use a standard browser alert (or toast)
            window.alert(msg);
          } else {
            // For native mobile app, trigger local push notification
            Notifications.scheduleNotificationAsync({
              content: {
                title: "Outbreak Alert",
                body: msg,
              },
              trigger: null,
            });
          }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null; // This is a headless component
}
