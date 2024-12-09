import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {themeColors} from '../../../theme/colors';
import {size} from '../../../theme/fontStyle';
import {fonts} from '../../../theme/fonts';

type SearchBarProps = {
  showBtn?: boolean;
  placeholder?: string;
  value?: string;
  onChangeText?: CallableFunction;
  handleSearch?: CallableFunction;
};

const SearchBar: React.FC<SearchBarProps> = ({
  showBtn,
  placeholder,
  value,
  onChangeText,
  handleSearch,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Icon
          name="search"
          size={15}
          color={themeColors.black}
          style={styles.icon}
        />

        <TextInput
          style={styles.input}
          placeholderTextColor={themeColors.black}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
      {showBtn && (
        <TouchableOpacity onPress={handleSearch}>
          <Text style={styles.searchBtn}>Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  inputWrapper: {
    position: 'relative',
    flex: 1,
    backgroundColor: themeColors.white,
    borderRadius: 10,
  },
  icon: {
    position: 'absolute',
    top: 16,
    left: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    paddingLeft: 35,
    color: themeColors.black,
    fontSize: size.sl,
    fontFamily: fonts.OpenSansRegular,
  },
  searchBtn: {
    backgroundColor: themeColors.primary,
    padding: 14,
    borderRadius: 10,
    color: themeColors.white,
    fontSize: size.sl,
    fontFamily: fonts.QuincyCFBold,
    marginLeft: 10,
  },
});
