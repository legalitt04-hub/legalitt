import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LEGAL_THEME } from '../../constants/legalAdviceTheme';

export const SearchBar = ({ value, onChangeText, placeholder = "Search legal matters...", onClear }) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={20} color={LEGAL_THEME.colors.secondaryText} style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={LEGAL_THEME.colors.secondaryText}
      />
      {value ? (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={LEGAL_THEME.colors.secondaryText} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LEGAL_THEME.colors.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LEGAL_THEME.colors.border,
    paddingHorizontal: 14,
    height: 48,
    marginVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: LEGAL_THEME.colors.primaryText,
  },
  clearButton: {
    padding: 4,
  },
});
