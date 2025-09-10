package com.darlachat.util;

import java.time.LocalDateTime;

public class TimeUtil {

    public static String getFormattedTime(LocalDateTime dateTime) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(dateTime.plusMinutes(1))) {
            return "Just now";
        } else if (now.isBefore(dateTime.plusHours(1))) {
            long minutes = java.time.Duration.between(dateTime, now).toMinutes();
            return minutes + " minutes ago";
        } else if (now.isBefore(dateTime.plusDays(1))) {
            long hours = java.time.Duration.between(dateTime, now).toHours();
            return hours + " hours ago";
        } else {
            long days = java.time.Duration.between(dateTime, now).toDays();
            return days <= 30 ? days + " days ago"
                    : dateTime.getDayOfMonth() + "/" + dateTime.getMonthValue() + "/" + dateTime.getYear();
        }
    }
}
