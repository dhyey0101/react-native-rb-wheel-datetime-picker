import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import RBSheet from "react-native-raw-bottom-sheet";

export interface CustomTimePickerProps {
  /** Required */
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;

  /** Optional props */
  initialTime?: string; // format: "HH:mm AM/PM"
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  primaryColor?: string;
  backgroundColor?: string;
  title?: string;
  cancelText?: string;
  confirmText?: string;
  fontFamily?: string;
  // confirmButtonColor?: string;
  cancelButtonColor?: string;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

const hours = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const periods = ["AM", "PM"];

export default function CustomTimePickerBottomSheet({
  isVisible,
  onClose,
  onConfirm,

  // optional defaults
  initialTime,
  minuteInterval = 1,
  primaryColor = "#007AFF",
  backgroundColor = "rgba(0,0,0,0.05)",
  title = "Select Time",
  cancelText = "Cancel",
  confirmText = "Confirm",
  fontFamily,
  // confirmButtonColor = '#007AFF',
  cancelButtonColor = "transparent",
}: CustomTimePickerProps) {
  const sheetRef = useRef<RBSheet>(null);

  const [selectedHour, setSelectedHour] = useState("01");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  const lastHourIndex = useRef<number | null>(null);
  const lastMinuteIndex = useRef<number | null>(null);
  const lastPeriodIndex = useRef<number | null>(null);

  const hourListRef = useRef<FlatList>(null);
  const minuteListRef = useRef<FlatList>(null);
  const periodListRef = useRef<FlatList>(null);

  // set initial time
  useEffect(() => {
    if (initialTime) {
      const [time, periodPart] = initialTime.split(" ");
      const [hr, min] = time.split(":");
      setSelectedHour(hr.padStart(2, "0"));
      setSelectedMinute(min.padStart(2, "0"));
      setPeriod(periodPart as "AM" | "PM");
    }
  }, [initialTime]);

  const minutes = useMemo(() => {
    return Array.from({ length: 60 / minuteInterval }, (_, i) =>
      (i * minuteInterval).toString().padStart(2, "0")
    );
  }, [minuteInterval]);

  // handle open/close
  useEffect(() => {
    if (isVisible) {
      sheetRef.current?.open();
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          const hourIndex = hours.findIndex((h) => h === selectedHour);
          const minuteIndex = minutes.findIndex((m) => m === selectedMinute);
          const periodIndex = periods.findIndex((p) => p === period);

          hourListRef.current?.scrollToOffset({
            offset: hourIndex * ITEM_HEIGHT,
            animated: true,
          });
          minuteListRef.current?.scrollToOffset({
            offset: minuteIndex * ITEM_HEIGHT,
            animated: true,
          });
          periodListRef.current?.scrollToOffset({
            offset: periodIndex * ITEM_HEIGHT,
            animated: true,
          });
        });
      });
    } else {
      sheetRef.current?.close();
    }
  }, [isVisible]);

  const triggerHaptic = () => {
    ReactNativeHapticFeedback.trigger("selection", {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    });
  };

  const handleConfirm = () => {
    const time = `${selectedHour}:${selectedMinute} ${period}`;
    onConfirm(time);
    onClose();
  };

  const renderPicker = (
    data: string[],
    selectedValue: string,
    setValue: (val: string) => void,
    lastIndexRef: React.MutableRefObject<number | null>,
    listRef?: React.RefObject<FlatList<any>>
  ) => (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={(item) => item}
      showsVerticalScrollIndicator={false}
      style={styles.list}
      contentContainerStyle={{ paddingVertical: PADDING }}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={(e) => {
        const offset = e.nativeEvent.contentOffset.y;
        const index = Math.round(offset / ITEM_HEIGHT);
        const value = data[index];

        if (index !== lastIndexRef.current && value !== selectedValue) {
          lastIndexRef.current = index;
          setValue(value);
          triggerHaptic();
        }
      }}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
        setValue(data[index]);
      }}
      renderItem={({ item }) => (
        <Text
          style={[
            styles.item,
            {
              fontFamily,
              color: item === selectedValue ? primaryColor : "#a3a3a3",
              fontSize: item === selectedValue ? 24 : 16,
              fontWeight: item === selectedValue ? "bold" : "normal",
            },
          ]}
        >
          {item}
        </Text>
      )}
    />
  );

  return (
    <RBSheet
      ref={sheetRef}
      height={LIST_HEIGHT + 140}
      enablePanDownToClose
      onClose={onClose}
      customStyles={{
        container: {
          borderRadius: 12,
          width: "90%",
          alignSelf: "center",
          justifyContent: "center",
          marginBottom: Platform.OS === "ios" ? 30 : 10,
        },
      }}
    >
      <View style={[styles.container, { backgroundColor: backgroundColor }]}>
        <Text style={[styles.title, { color: primaryColor, fontFamily }]}>
          {title}
        </Text>

        <View style={styles.pickerContainer}>
          {renderPicker(
            hours,
            selectedHour,
            setSelectedHour,
            lastHourIndex,
            hourListRef
          )}
          {renderPicker(
            minutes,
            selectedMinute,
            setSelectedMinute,
            lastMinuteIndex,
            minuteListRef
          )}
          {renderPicker(
            periods,
            period,
            setPeriod,
            lastPeriodIndex,
            periodListRef
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.button,
              {
                borderColor: primaryColor,
                borderWidth: 1,
                backgroundColor: cancelButtonColor,
              },
            ]}
          >
            <Text
              style={[
                styles.cancelTextStyle,
                {
                  fontFamily,
                  color: primaryColor,
                },
              ]}
            >
              {cancelText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.button, { backgroundColor: primaryColor }]}
          >
            <Text style={[styles.confirmTextStyle, { fontFamily }]}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  list: {
    height: LIST_HEIGHT,
    width: 60,
    marginHorizontal: 6,
  },
  item: {
    height: ITEM_HEIGHT,
    textAlign: "center",
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  button: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 16,
    height: 48,
  },
  confirmTextStyle: {
    color: "#fff",
    textAlign: "center",
  },
  cancelTextStyle: {
    textAlign: "center",
  },
});
