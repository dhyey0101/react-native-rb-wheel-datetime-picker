# React Native Wheel DateTime Picker

A customizable, smooth, and haptic-enabled **wheel-style date picker** for React Native.
It uses `FlatList` to simulate iOS-style scroll wheels, wrapped inside a bottom sheet for a modern UI.

---

## ✨ Features

- 🎡 **Wheel-style picker** for days, months, and years
- 📱 **Cross-platform** (iOS & Android)
- 🎨 **Customizable** colors & text styles
- 📳 **Haptic feedback** for better UX
- 📅 **Initial date & time support**
- 🔒 **Min/Max date support** to restrict selectable range
- ⏱️ **Minute interval selection** (1, 5, 10, 15, 30…)
- 📦 Built with `react-native-raw-bottom-sheet`

---

## 📦 Installation

```sh
npm install react-native-rb-wheel-datetime-picker
```

or with yarn:

```sh
yarn add react-native-rb-wheel-datetime-picker
```

Also install required peer dependencies:

```sh
npm install react-native-haptic-feedback react-native-raw-bottom-sheet
```

---

## 🚀 Date Picker Usage

```tsx
import React, { useState } from "react";
import { Button, View, Text } from "react-native";
import DatePicker from "react-native-rb-wheel-datetime-picker";

export default function App() {
  const [visible, setVisible] = useState(false);
  const [date, setDate] = useState<Date | null>(null);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Open Date Picker" onPress={() => setVisible(true)} />
      {date && <Text>Selected Date: {date.toDateString()}</Text>}

      <DatePicker
        title="Select your date"
        isVisible={visible}
        initialDate={new Date()}
        minDate={new Date(2020, 0, 15)} // Jan 15, 2020
        maxDate={new Date(2026, 11, 20)} // Dec 20, 2026
        onClose={() => setVisible(false)}
        onConfirm={(selectedDate) => {
          setDate(selectedDate);
          setVisible(false);
        }}
        primaryColor="#007AFF"
        themeBackgroundColor="#fff"
      />
    </View>
  );
}
```

## ⏱️ Time Picker Usage

```tsx
import React, { useState } from "react";
import { Button, View, Text } from "react-native";
import TimePicker from "react-native-rb-wheel-datetime-picker";

export default function App() {
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState<string | null>(null);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Open Time Picker" onPress={() => setVisible(true)} />
      {time && <Text>Selected Time: {time}</Text>}

      <TimePicker
        isVisible={visible}
        initialTime="09:30 AM"
        minuteInterval={5}
        title="Select Time"
        cancelText="Close"
        confirmText="Set"
        primaryColor="#007AFF"
        backgroundColor="#F9F9F9"
        onClose={() => setVisible(false)}
        onConfirm={(selectedTime) => {
          setTime(selectedTime);
          setVisible(false);
        }}
      />
    </View>
  );
}
```

---

## ⚙️ Date Picker Props

| Prop                   | Type                   | Default         | Description                                                            |
| ---------------------- | ---------------------- | --------------- | ---------------------------------------------------------------------- |
| `title`                | `string`               | `"Select Date"` | Title text shown at the top                                            |
| `isVisible`            | `boolean`              | `false`         | Controls modal visibility                                              |
| `onClose`              | `() => void`           | **required**    | Called when modal is closed                                            |
| `onConfirm`            | `(date: Date) => void` | **required**    | Returns the selected date                                              |
| `initialDate`          | `Date`                 | `new Date()`    | Preselected date when opened                                           |
| `themeBackgroundColor` | `string`               | `"#FFFFFF"`     | Background color of the sheet                                          |
| `primaryColor`         | `string`               | `"#000000"`     | Highlight color for selected items & confirm button                    |
| `titleTextStyle`       | `TextStyle`            | `undefined`     | Custom style for the title text                                        |
| `itemTextStyle`        | `TextStyle`            | `undefined`     | Custom style for list items                                            |
| `minDate`              | `Date`                 | `undefined`     | Minimum selectable date (e.g. `new Date(2020, 0, 15)` → Jan 15, 2020)  |
| `maxDate`              | `Date`                 | `undefined`     | Maximum selectable date (e.g. `new Date(2026, 11, 20)` → Dec 20, 2026) |

## ⚙️ Time Picker Props

| Prop                | Type                                 | Default         | Description                                         |
| ------------------- | ------------------------------------ | --------------- | --------------------------------------------------- |
| `isVisible`         | `boolean`                            | `false`         | Controls modal visibility                           |
| `onClose`           | `() => void`                         | **required**    | Called when modal is closed                         |
| `onConfirm`         | `(time: string) => void`             | **required**    | Returns selected time in format `"HH:mm AM/PM"`     |
| `initialTime`       | `string`                             | `"01:00 AM"`    | Preselected time (format: `"HH:mm AM/PM"`)          |
| `minuteInterval`    | `1 \| 2 \| 3 \| 5 \| 10 \| 15 \| 30` | `1`             | Interval for minutes (e.g., 5 → 00, 05, 10, 15...)  |
| `title`             | `string`                             | `"Select Time"` | Title text shown at the top                         |
| `cancelText`        | `string`                             | `"Cancel"`      | Text for the cancel button                          |
| `confirmText`       | `string`                             | `"Confirm"`     | Text for the confirm button                         |
| `primaryColor`      | `string`                             | `"#007AFF"`     | Highlight color for selected items & confirm button |
| `backgroundColor`   | `string`                             | `"#FFFFFF"`     | Background color of the sheet                       |
| `cancelButtonColor` | `string`                             | `"transparent"` | Background color of cancel button                   |
| `fontFamily`        | `string`                             | `undefined`     | Apply custom font family                            |

---

## 📷 Preview

- Date Picker

![Screenshot 2025-09-17 at 3 08 50 PM](https://github.com/user-attachments/assets/c6c4e1b2-1fcb-4f6e-9f70-7927fd68d06d)

- Time Picker

---

## 📝 License

MIT © [CompileX](https://github.com/dhyey0101)
Feel free to contribute via pull requests.

---
