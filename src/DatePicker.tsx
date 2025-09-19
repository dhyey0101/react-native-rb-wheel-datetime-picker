import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  InteractionManager,
  Platform,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import ReactNativeHapticFeedback from "react-native-haptic-feedback";
import RBSheet from "react-native-raw-bottom-sheet";

const { width } = Dimensions.get("window");
const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING = ((VISIBLE_ITEMS - 1) / 2) * ITEM_HEIGHT;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const years = Array.from({ length: 200 }, (_, i) => 1950 + i);

function getDaysInMonth(month: number, year: number): number[] {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => i + 1);
}

const triggerHaptic = () => {
  ReactNativeHapticFeedback.trigger("selection", {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  });
};

export default function DatePicker({
  title,
  isVisible,
  onClose,
  onConfirm,
  initialDate,
  themeBackgroundColor = "#FFFFFF",
  primaryColor,
  titleTextStyle,
  itemTextStyle,
  minDate,
  maxDate,
}: {
  title?: string;
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialDate?: Date;
  themeBackgroundColor?: string;
  primaryColor?: string;
  titleTextStyle?: TextStyle;
  itemTextStyle?: TextStyle;
  minDate?: Date;
  maxDate?: Date;
}) {
  const sheetRef = useRef<RBSheet>(null);

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  const lastDayIndex = useRef<number | null>(null);
  const lastMonthIndex = useRef<number | null>(null);
  const lastYearIndex = useRef<number | null>(null);

  const dayListRef = useRef<FlatList>(null);
  const monthListRef = useRef<FlatList>(null);
  const yearListRef = useRef<FlatList>(null);
  const didLayout = useRef(false);

  // Clamp year list
  const minYear = minDate ? minDate.getFullYear() : 1950;
  const maxYear = maxDate ? maxDate.getFullYear() : 2150;
  const availableYears = years.filter((y) => y >= minYear && y <= maxYear);

  // Clamp month list
  const availableMonths =
    selectedYear === minYear && minDate
      ? months.slice(minDate.getMonth())
      : selectedYear === maxYear && maxDate
      ? months.slice(0, maxDate.getMonth() + 1)
      : months;

  // Clamp days list
  const getClampedDays = (month: number, year: number) => {
    let allDays = getDaysInMonth(month, year);

    if (minDate && year === minYear && month === minDate.getMonth()) {
      allDays = allDays.filter((d) => d >= minDate.getDate());
    }
    if (maxDate && year === maxYear && month === maxDate.getMonth()) {
      allDays = allDays.filter((d) => d <= maxDate.getDate());
    }

    return allDays;
  };

  const scrollToInitialDate = (date: Date) => {
    const clampedDate = new Date(
      Math.min(
        Math.max(date.getTime(), minDate?.getTime() ?? -Infinity),
        maxDate?.getTime() ?? Infinity
      )
    );

    const day = clampedDate.getDate();
    const month = clampedDate.getMonth();
    const year = clampedDate.getFullYear();
    const yearIndex = availableYears.findIndex((y) => y === year);

    InteractionManager.runAfterInteractions(() => {
      dayListRef.current?.scrollToIndex({ index: day - 1, animated: false });
      monthListRef.current?.scrollToIndex({ index: month, animated: false });
      yearListRef.current?.scrollToIndex({ index: yearIndex, animated: false });
    });
  };

  useEffect(() => {
    if (isVisible && initialDate) {
      const clampedDate = new Date(
        Math.min(
          Math.max(initialDate.getTime(), minDate?.getTime() ?? -Infinity),
          maxDate?.getTime() ?? Infinity
        )
      );

      const d = clampedDate.getDate();
      const m = clampedDate.getMonth();
      const y = clampedDate.getFullYear();

      setSelectedDay(d);
      setSelectedMonth(m);
      setSelectedYear(y);
      setDaysInMonth(getClampedDays(m, y));

      didLayout.current = false;
      sheetRef.current?.open();
    } else {
      sheetRef.current?.close();
    }
  }, [isVisible, initialDate, minDate, maxDate]);

  useEffect(() => {
    if (selectedMonth !== null && selectedYear !== null) {
      const updatedDays = getClampedDays(selectedMonth, selectedYear);
      setDaysInMonth(updatedDays);
      if (selectedDay !== null && selectedDay > updatedDays.length) {
        setSelectedDay(updatedDays[0]);
      }
    }
  }, [selectedMonth, selectedYear, minDate, maxDate]);

  const renderPicker = (
    data: string[] | number[],
    selectedValue: string | number,
    setValue: (val: any) => void,
    lastIndexRef: React.MutableRefObject<number | null>,
    listRef: React.RefObject<FlatList<any>>
  ) => (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={(item) => item.toString()}
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
            itemTextStyle,
            item === selectedValue && styles.selectedItem,
            {
              color: item === selectedValue ? primaryColor : "#a3a3a3",
              fontSize: item === selectedValue ? 18 : 14,
            },
          ]}
        >
          {item}
        </Text>
      )}
      getItemLayout={(data, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
    />
  );

  const handleConfirm = () => {
    if (selectedDay != null && selectedMonth != null && selectedYear != null) {
      let finalDate = new Date(selectedYear, selectedMonth, selectedDay);

      if (minDate && finalDate < minDate) finalDate = minDate;
      if (maxDate && finalDate > maxDate) finalDate = maxDate;

      onConfirm(finalDate);
      onClose();
    }
  };

  return (
    <RBSheet
      ref={sheetRef}
      height={Platform.OS === "ios" ? LIST_HEIGHT + 145 : LIST_HEIGHT + 150}
      snapPoints={[LIST_HEIGHT + 200]}
      onClose={onClose}
      index={-1}
      customStyles={{
        container: {
          borderRadius: 13,
          width: width - 34,
          alignSelf: "center",
          marginBottom: Platform.OS === "ios" ? 30 : 10,
        },
      }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeBackgroundColor,
          },
        ]}
      >
        <Text style={[styles.title, titleTextStyle]}>
          {title ?? "Select Date"}
        </Text>
        <View
          style={styles.pickerContainer}
          onLayout={() => {
            if (!didLayout.current && isVisible && initialDate) {
              didLayout.current = true;
              scrollToInitialDate(initialDate);
            }
          }}
        >
          {selectedDay !== null &&
            renderPicker(
              daysInMonth,
              selectedDay,
              setSelectedDay,
              lastDayIndex,
              dayListRef
            )}
          {selectedMonth !== null &&
            renderPicker(
              availableMonths,
              months[selectedMonth],
              (val) => setSelectedMonth(months.indexOf(val)),
              lastMonthIndex,
              monthListRef
            )}
          {selectedYear !== null &&
            renderPicker(
              availableYears,
              selectedYear,
              setSelectedYear,
              lastYearIndex,
              yearListRef
            )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.buttonStyle,
              { borderWidth: 1, borderColor: primaryColor ?? "#000000" },
            ]}
          >
            <Text style={[styles.itemTextStyle, itemTextStyle]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleConfirm}
            style={[
              styles.buttonStyle,
              {
                borderWidth: 1,
                borderColor: primaryColor ?? "#000000",
                backgroundColor: primaryColor,
              },
            ]}
          >
            <Text
              style={[
                styles.itemTextStyle,
                itemTextStyle,
                { color: "#FFFFFF" },
              ]}
            >
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  pickerContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  list: {
    height: LIST_HEIGHT,
    width: 90,
  },
  item: {
    fontSize: 20,
    height: ITEM_HEIGHT,
    textAlign: "center",
    color: "#888",
  },
  selectedItem: {
    fontWeight: "bold",
    color: "#000",
    fontSize: 24,
  },
  buttonRow: {
    marginTop: 20,
    flexDirection: "row",
    gap: 16,
  },
  buttonStyle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    borderRadius: 10,
  },
  itemTextStyle: {
    color: "#000000",
  },
});
