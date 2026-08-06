/**
 * ScreenLayout.jsx
 *
 * Universal screen wrapper that provides:
 *   - SafeAreaView (from react-native-safe-area-context) – works on notched/island devices
 *   - Optional KeyboardAvoidingView for form screens
 *   - Tablet-friendly centered max-width container
 *   - Landscape-aware horizontal padding
 *   - StatusBar management
 *
 * Usage:
 *   <ScreenLayout>…</ScreenLayout>                        // default white, KAV off
 *   <ScreenLayout withKeyboard bg="#F9FAFB">…</ScreenLayout>  // form screen
 *   <ScreenLayout edges={['top']} scrollable>…</ScreenLayout>  // custom edges + scroll
 */
import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isTablet, CONTENT_MAX_WIDTH, getHorizontalPadding } from '../utils/responsive';

const ScreenLayout = ({
  children,
  /** Background colour of the whole screen */
  bg = '#FFFFFF',
  /** StatusBar style */
  barStyle = 'dark-content',
  /** Safe area edges to apply insets to */
  edges = ['top', 'bottom', 'left', 'right'],
  /** Wrap children in KeyboardAvoidingView (enable for form screens) */
  withKeyboard = false,
  /** Wrap children in ScrollView */
  scrollable = false,
  /** Extra style for the inner content container */
  contentStyle,
  /** Additional style for SafeAreaView */
  style,
}) => {
  const tabletMode = isTablet();
  const hPad = getHorizontalPadding();

  const innerContainerStyle = [
    styles.inner,
    tabletMode && styles.tabletInner,
    { paddingHorizontal: tabletMode ? 0 : hPad },
    contentStyle,
  ];

  let content = scrollable ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[{ flexGrow: 1 }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={innerContainerStyle}>{children}</View>
  );

  if (withKeyboard) {
    content = (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }, style]} edges={edges}>
      <StatusBar backgroundColor={bg} barStyle={barStyle} translucent={false} />
      {content}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  tabletInner: {
    width: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
  },
});

export default ScreenLayout;
