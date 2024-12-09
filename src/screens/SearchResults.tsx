import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {themeColors} from '../theme/colors';
import {size} from '../theme/fontStyle';
import {fonts} from '../theme/fonts';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {searchDiseasesORSymptoms} from '../services/search';
import {SCREENS} from '../constants/screens';

type SearchResultsProps = {
  navigation?: NativeStackNavigationProp<any>;
  route?: {
    params: {
      searchText?: string;
      type?: string;
    };
  };
};

const SearchResults: React.FC<SearchResultsProps> = ({navigation, route}) => {
  const {searchText, type} = route?.params || {};
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any>();
  const loadResults = async () => {
    searchDiseasesORSymptoms(
      searchText as string,
      type as string,
      () => setLoading(true),
      (successData: any) => {
        setResults(successData);
        setLoading(false);
      },
      (error: any) => {
        console.log('Error while searching', error);
        setLoading(false);
      },
    );
  };

  useEffect(() => {
    if (searchText && type) {
      loadResults();
    }
  }, [searchText, type]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.listTypeText}>
          Search results for {`"${searchText}"`}
        </Text>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={themeColors.primary} size={'large'} />
        </View>
      ) : results?.length == 0 ? (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No record found</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item?.id?.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() =>
                navigation?.navigate(
                  type == 'diseases' ? 'DiseasesDetails' : 'SymptomsDetails',
                  {id: item?.id},
                )
              }>
              <Text style={styles.itemText}>
                {item?.condition_name || item?.symptom_name}
              </Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
        />
      )}
    </View>
  );
};

export default SearchResults;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.lightGray,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  listTypeText: {
    fontFamily: fonts.OpenSansBold,
    fontSize: size.md,
    color: themeColors.darkGray,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: size.lg,
    fontFamily: fonts.OpenSansRegular,
    color: themeColors.darkGray,
  },
  itemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: themeColors.darkGray,
    paddingVertical: 10,
  },
  itemText: {
    color: themeColors.darkGray,
    fontSize: size.md,
    fontFamily: fonts.OpenSansBold,
  },
});
